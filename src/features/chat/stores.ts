import { create } from 'zustand'
import type { Conversation, Message } from './api/schemas'
import { listMessages, streamMessage } from './api/fetchers'
import type { AccessMode, AiOptions } from '@/features/inference'
import { useInferenceSettings } from '@/features/inference'
import { ensureApproval } from '@/features/approval'
import { ApiError } from '@/shared/api'
import { showToast } from '@/shared/components'
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
  send: (conversationId: string, text: string, evidenceIds?: string[]) => Promise<void>
  retry: () => Promise<void>
  abort: () => void
  reset: () => void
}

let abortCtrl: AbortController | null = null

export type MessagesDeps = {
  aiOptions: () => AiOptions | null
  accessMode: () => AccessMode
  byokKey: () => string
  ensureApproval: (id: string) => void
}

export const createMessagesStore = (deps: MessagesDeps) => create<MessagesState>()((set, get) => ({
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

  send: async (conversationId, text, evidenceIds = []) => {
    const ai = deps.aiOptions()
    if (!ai) {
      showToast(t('chat.modelConfigFailed'), 'circle-alert')
      return
    }
    const accessMode = deps.accessMode()
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
          context: { evidenceIds },
          ai,
          accessMode,
        },
        {
          signal: controller.signal,
          byokKey:
            ai.credentialMode === 'BYOK'
              ? deps.byokKey()
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
              deps.ensureApproval(id)
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
      if (!controller.signal.aborted) {
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
    } finally {
      if (controller.signal.aborted) {
        set((s) => ({
          messages: s.messages.filter((m) => m.id !== tempId),
          sendStatus: 'idle',
          streamText: '',
        }))
      }
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

type PendingFilesState = {
  files: File[]
  add: (files: File[]) => void
  remove: (index: number) => void
  clear: () => void
}

export const usePendingFiles = create<PendingFilesState>()((set) => ({
  files: [],
  add: (files) => set((s) => ({ files: [...s.files, ...files] })),
  remove: (index) => set((s) => ({ files: s.files.filter((_, i) => i !== index) })),
  clear: () => set({ files: [] }),
}))

export const useMessagesStore = createMessagesStore({
  aiOptions: () => useInferenceSettings.getState().aiOptions(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
  ensureApproval: (id) => void ensureApproval(id),
})

export const isProjectConversation = (conversation: Conversation): boolean =>
  conversation.projectId != null
