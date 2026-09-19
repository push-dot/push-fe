import { create } from 'zustand'
import type { Message } from '@/shared/api'
import { ApiError, listMessages, streamMessage } from '@/shared/api'
import { useApprovalsStore } from '@/entities/approval'
import { useInferenceSettings } from './inference-settings'
import { showToast } from '@/shared/ui'
import { t } from '@/shared/i18n'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'
export type SendStatus = 'idle' | 'sending' | 'streaming' | 'failed'

const PAGE_SIZE = 50

type ChatMessageResult = {
  userMessage: Message
  assistantMessage: Message
  approvalIds: string[]
}

const isChatMessageResult = (
  result: unknown,
): result is { kind: 'CHAT_MESSAGE'; value: ChatMessageResult } =>
  typeof result === 'object' &&
  result !== null &&
  (result as { kind?: string }).kind === 'CHAT_MESSAGE'

type FailedSend = { tempId: string; text: string; error: string }

type MessagesState = {
  conversationId: string | null
  messages: Message[]
  status: LoadStatus
  error: string | null
  nextCursor: string | null
  hasMore: boolean
  loadingMore: boolean
  sendStatus: SendStatus
  streamText: string
  failed: FailedSend | null
  load: (conversationId: string) => Promise<void>
  loadMore: () => Promise<void>
  send: (conversationId: string, text: string) => Promise<void>
  retry: () => Promise<void>
  abort: () => void
  reset: () => void
}

let abortCtrl: AbortController | null = null

export const useMessagesStore = create<MessagesState>()((set, get) => ({
  conversationId: null,
  messages: [],
  status: 'idle',
  error: null,
  nextCursor: null,
  hasMore: false,
  loadingMore: false,
  sendStatus: 'idle',
  streamText: '',
  failed: null,

  load: async (conversationId) => {
    set({
      conversationId,
      status: 'loading',
      error: null,
      messages: [],
      nextCursor: null,
      hasMore: false,
      sendStatus: 'idle',
      streamText: '',
      failed: null,
    })
    try {
      const env = await listMessages(conversationId, { limit: PAGE_SIZE })
      set({
        messages: [...env.data].reverse(),
        status: 'success',
        nextCursor: env.page.nextCursor,
        hasMore: env.page.hasMore,
      })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'error',
      })
    }
  },

  loadMore: async () => {
    const { conversationId, nextCursor, hasMore, loadingMore } = get()
    if (!conversationId || !hasMore || loadingMore || !nextCursor) return
    set({ loadingMore: true })
    try {
      const env = await listMessages(conversationId, {
        limit: PAGE_SIZE,
        cursor: nextCursor,
      })
      set((s) => ({
        messages: [...[...env.data].reverse(), ...s.messages],
        nextCursor: env.page.nextCursor,
        hasMore: env.page.hasMore,
        loadingMore: false,
      }))
    } catch {
      set({ loadingMore: false })
      showToast(t('chat.loadMoreFailed'), 'circle-alert')
    }
  },

  send: async (conversationId, text) => {
    const ai = useInferenceSettings.getState().aiOptions()
    if (!ai) {
      showToast(t('chat.modelConfigFailed'), 'circle-alert')
      return
    }
    const accessMode = useInferenceSettings.getState().accessMode
    abortCtrl?.abort()
    const controller = new AbortController()
    abortCtrl = controller
    const tempId = `local-${crypto.randomUUID()}`
    const optimistic: Message = {
      id: tempId,
      conversationId,
      role: 'USER',
      text,
      attachments: [],
      operationId: null,
      createdAt: new Date().toISOString(),
    }
    set((s) => ({
      conversationId: s.conversationId ?? conversationId,
      messages: [...s.messages, optimistic],
      sendStatus: 'sending',
      streamText: '',
      failed: null,
    }))
    let partial = ''
    try {
      for await (const ev of streamMessage(
        conversationId,
        {
          text,
          context: { evidenceIds: [] },
          ai,
          accessMode,
        },
        {
          signal: controller.signal,
          byokKey:
            ai.credentialMode === 'BYOK'
              ? useInferenceSettings.getState().byokKey
              : undefined,
        },
      )) {
        if (ev.type === 'token') {
          partial += ev.text
          set({ sendStatus: 'streaming', streamText: partial })
        } else if (ev.type === 'error') {
          throw new ApiError(ev.error.message, ev.error.code, 0, ev.error.details)
        } else if (ev.type === 'done') {
          const { operation } = ev
          const result = operation.result
          if (operation.status === 'SUCCEEDED' && isChatMessageResult(result)) {
            const { userMessage, assistantMessage, approvalIds } = result.value
            set((s) => ({
              messages: [
                ...s.messages.filter((m) => m.id !== tempId),
                userMessage,
                assistantMessage,
              ],
              sendStatus: 'idle',
              streamText: '',
            }))
            for (const id of approvalIds) {
              void useApprovalsStore.getState().ensure(id)
            }
          } else {
            throw new ApiError(
              operation.error?.message ?? t('chat.noResponse'),
              operation.error?.code ?? 'OPERATION_FAILED',
              0,
            )
          }
        }
      }
    } catch (error) {
      if (controller.signal.aborted) {
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== tempId),
          sendStatus: 'idle',
          streamText: '',
        }))
        return
      }
      set({
        sendStatus: 'failed',
        streamText: '',
        failed: {
          tempId,
          text,
          error: error instanceof Error ? error.message : t('chat.sendFailed'),
        },
      })
    }
  },

  retry: async () => {
    const { conversationId, failed } = get()
    if (!conversationId || !failed) return
    set((s) => ({
      messages: s.messages.filter((m) => m.id !== failed.tempId),
      failed: null,
    }))
    await get().send(conversationId, failed.text)
  },

  abort: () => {
    abortCtrl?.abort()
  },

  reset: () => {
    abortCtrl?.abort()
    abortCtrl = null
    set({
      conversationId: null,
      messages: [],
      status: 'idle',
      error: null,
      nextCursor: null,
      hasMore: false,
      loadingMore: false,
      sendStatus: 'idle',
      streamText: '',
      failed: null,
    })
  },
}))
