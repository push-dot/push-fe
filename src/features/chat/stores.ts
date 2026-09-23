import { create } from 'zustand'
import type { Conversation, Message, MessageStreamEvent } from './api/schemas'
import { listMessages, streamActive, streamMessage } from './api/fetchers'
import { chatKeys } from './api/hooks'
import {
  MESSAGES_PAGE_SIZE,
  STREAM_FLUSH_MS,
  STREAM_FOLLOW_UP_MS,
  STREAM_MAX_RECONNECTS,
  STREAM_RECONNECT_MS,
} from './constants'
import { queryClient, trackExperimentEvent } from '@/shared/api'
import { experimentVariant, trackExperiment } from '@/shared/lib/experiment'
import { EXPERIMENT_EVENTS, EXPERIMENT_KEYS } from '@/shared/constants'
import type { AccessMode, AiOptions } from '@/features/inference'
import { useInferenceSettings } from '@/features/inference'
import { ensureApproval } from '@/features/approval'
import { ApiError } from '@/shared/api'
import type { Operation } from '@/shared/api'
import { showToast } from '@/shared/components'
import { t } from '@/shared/i18n'

type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

export type SendStatus = 'idle' | 'sending' | 'streaming' | 'failed'

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
  streamStatus: string
  failed: FailedSend | null
  load: (conversationId: string) => Promise<void>
  attachStream: (conversationId: string) => Promise<void>
  loadMore: () => Promise<void>
  send: (conversationId: string, text: string, evidence?: { id: string; title: string }[]) => Promise<void>
  retry: () => Promise<void>
  abort: () => void
  reset: () => void
}

let abortCtrl: AbortController | null = null

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type StreamError = {
  code: string
  message: string
  details?: Record<string, unknown>
}

type ConsumeResult = 'done' | 'ended' | 'dropped' | 'detached' | { error: StreamError }

export type MessagesDeps = {
  aiOptions: () => AiOptions | null
  ensureModels: () => Promise<void>
  accessMode: () => AccessMode
  byokKey: () => string
  ensureApproval: (id: string) => void
  streamRenderVariant: () => Promise<string>
}

export const createMessagesStore = (deps: MessagesDeps) =>
  create<MessagesState>()((set, get) => {
    let lastSeq = 0
    let streamVariant = 'A'
    let lastDoneAt = 0
    const buf = {
      text: '',
      status: '',
      timer: null as ReturnType<typeof setTimeout> | null,
    }

    const flushStream = () => {
      buf.timer = null
      if (buf.text) {
        trackExperiment(EXPERIMENT_KEYS.streamRender, EXPERIMENT_EVENTS.exposure)
      }
      set({
        sendStatus: 'streaming',
        streamText: streamVariant === 'B' ? '' : buf.text,
        streamStatus: buf.status,
      })
    }

    const scheduleFlush = () => {
      if (!buf.timer) buf.timer = setTimeout(flushStream, STREAM_FLUSH_MS)
    }

    const clearStream = () => {
      if (buf.timer) clearTimeout(buf.timer)
      buf.timer = null
      buf.text = ''
      buf.status = ''
    }

    const idleStream = () => {
      clearStream()
      set({ sendStatus: 'idle', streamText: '', streamStatus: '' })
    }

    const reconcile = async (conversationId: string) => {
      const env = await listMessages(conversationId, { limit: MESSAGES_PAGE_SIZE })
      clearStream()
      set({
        messages: [...env.data].reverse(),
        sendStatus: 'idle',
        streamText: '',
        streamStatus: '',
      })
    }

    const commitDone = (operation: Operation, tempId: string | null): boolean => {
      const result = operation?.result
      if (operation?.status !== 'SUCCEEDED' || !isChatMessageResult(result)) return false
      const { userMessage, assistantMessage, approvalIds } = result.value
      lastDoneAt = Date.now()
      trackExperiment(EXPERIMENT_KEYS.streamRender, EXPERIMENT_EVENTS.exposure)
      clearStream()
      set((s) => ({
        messages: [
          ...s.messages.filter(
            (m) =>
              m.id !== tempId &&
              m.id !== userMessage.id &&
              m.id !== assistantMessage.id,
          ),
          userMessage,
          assistantMessage,
        ],
        sendStatus: 'idle',
        streamText: '',
        streamStatus: '',
      }))
      for (const id of approvalIds) {
        deps.ensureApproval(id)
      }
      return true
    }

    const consume = async (
      conversationId: string,
      events: AsyncIterable<MessageStreamEvent>,
      tempId: string | null,
      onBadDone: (operation: Operation) => void | Promise<void>,
    ): Promise<ConsumeResult> => {
      try {
        for await (const ev of events) {
          if (get().conversationId !== conversationId) return 'detached'
          if (ev.seq != null) {
            if (ev.seq <= lastSeq) continue
            lastSeq = ev.seq
          }
          if (ev.type === 'token') {
            buf.text += ev.text
            scheduleFlush()
          } else if (ev.type === 'status') {
            buf.status = ev.text
            scheduleFlush()
          } else if (ev.type === 'done') {
            if (buf.timer) flushStream()
            if (!(await commitDone(ev.operation, tempId))) {
              await onBadDone(ev.operation)
            }
            return 'done'
          } else if (ev.type === 'error') {
            return { error: ev.error }
          }
        }
        return 'ended'
      } catch (error) {
        if (error instanceof ApiError) throw error
        return 'dropped'
      }
    }

    const pumpActive = (conversationId: string, signal: AbortSignal) =>
      streamActive(conversationId, { signal, after: lastSeq })

    const resumeActive = async (
      conversationId: string,
      controller: AbortController,
      tempId: string | null,
      onBadDone: (operation: Operation) => void | Promise<void>,
    ): Promise<ConsumeResult> => {
      let attempts = 0
      for (;;) {
        const res = await consume(
          conversationId,
          pumpActive(conversationId, controller.signal),
          tempId,
          onBadDone,
        )
        if (res !== 'dropped') return res
        attempts += 1
        if (
          attempts >= STREAM_MAX_RECONNECTS ||
          controller.signal.aborted ||
          get().conversationId !== conversationId
        ) {
          return res
        }
        await sleep(STREAM_RECONNECT_MS)
      }
    }

    return {
      conversationId: null,
      messages: [],
      status: 'idle',
      error: null,
      nextCursor: null,
      hasMore: false,
      loadingMore: false,
      sendStatus: 'idle',
      streamText: '',
      streamStatus: '',
      failed: null,

      load: async (conversationId) => {
        abortCtrl?.abort()
        clearStream()
        lastSeq = 0
        set({
          conversationId,
          status: 'loading',
          error: null,
          messages: [],
          nextCursor: null,
          hasMore: false,
          sendStatus: 'idle',
          streamText: '',
          streamStatus: '',
          failed: null,
        })
        try {
          const env = await queryClient.fetchQuery({
            queryKey: chatKeys.messages(conversationId),
            queryFn: () => listMessages(conversationId, { limit: MESSAGES_PAGE_SIZE }),
          })
          set({
            messages: [...env.data].reverse(),
            status: 'success',
            nextCursor: env.page.nextCursor,
            hasMore: env.page.hasMore,
          })
          void get().attachStream(conversationId)
        } catch (error) {
          set({
            status: 'error',
            error: error instanceof Error ? error.message : 'error',
          })
        }
      },

      attachStream: async (conversationId) => {
        const { sendStatus } = get()
        if (sendStatus === 'sending' || sendStatus === 'streaming') return
        streamVariant = await deps.streamRenderVariant()
        abortCtrl?.abort()
        const controller = new AbortController()
        abortCtrl = controller
        try {
          const res = await resumeActive(conversationId, controller, null, () =>
            reconcile(conversationId),
          )
          if (res === 'ended') {
            if (buf.text || buf.status) {
              await reconcile(conversationId)
            } else {
              idleStream()
            }
          } else if (typeof res === 'object' && res !== null) {
            showToast(res.error.message, 'circle-alert')
            idleStream()
          } else if (res === 'dropped') {
            idleStream()
          }
        } catch {
          idleStream()
        } finally {
          if (controller.signal.aborted) idleStream()
        }
      },

      loadMore: async () => {
        const { conversationId, nextCursor, hasMore, loadingMore } = get()
        if (!conversationId || !hasMore || loadingMore || !nextCursor) return
        set({ loadingMore: true })
        try {
          const env = await listMessages(conversationId, {
            limit: MESSAGES_PAGE_SIZE,
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

      send: async (conversationId, text, evidence = []) => {
        let ai = deps.aiOptions()
        if (!ai) {
          await deps.ensureModels()
          ai = deps.aiOptions()
        }
        if (!ai) {
          showToast(t('chat.modelConfigFailed'), 'circle-alert')
          return
        }
        const accessMode = deps.accessMode()
        streamVariant = await deps.streamRenderVariant()
        if (Date.now() - lastDoneAt <= STREAM_FOLLOW_UP_MS) {
          trackExperiment(
            EXPERIMENT_KEYS.streamRender,
            EXPERIMENT_EVENTS.conversion,
            String(lastDoneAt),
          )
        }
        void queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) })
        abortCtrl?.abort()
        const controller = new AbortController()
        abortCtrl = controller
        const tempId = `local-${crypto.randomUUID()}`
        const optimistic: Message = {
          id: tempId,
          conversationId,
          role: 'USER',
          text,
          attachments: evidence.map((e) => ({ type: 'EVIDENCE' as const, id: e.id, title: e.title })),
          operationId: null,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({
          conversationId: s.conversationId ?? conversationId,
          messages: [...s.messages, optimistic],
          sendStatus: 'sending',
          streamText: '',
          streamStatus: '',
          failed: null,
        }))
        const badDone = (operation: Operation) => {
          throw new ApiError(
            operation.error?.message ?? t('chat.noResponse'),
            operation.error?.code ?? 'OPERATION_FAILED',
            0,
          )
        }
        try {
          let res: ConsumeResult
          try {
            res = await consume(
              conversationId,
              streamMessage(
                conversationId,
                {
                  text,
                  context: { evidenceIds: evidence.map((e) => e.id) },
                  ai,
                  accessMode,
                },
                {
                  signal: controller.signal,
                  byokKey: ai.credentialMode === 'BYOK' ? deps.byokKey() : undefined,
                },
              ),
              tempId,
              badDone,
            )
          } catch (error) {
            if (error instanceof ApiError) throw error
            res = 'dropped'
          }
          if (res === 'dropped' || res === 'ended') {
            res = await resumeActive(conversationId, controller, tempId, badDone)
          }
          if (typeof res === 'object' && res !== null) {
            throw new ApiError(res.error.message, res.error.code, 0, res.error.details)
          }
          if (res === 'dropped' || res === 'ended') {
            throw new ApiError(t('chat.sendFailed'), 'NETWORK_ERROR', 0)
          }
        } catch (error) {
          if (!controller.signal.aborted) {
            clearStream()
            set({
              sendStatus: 'failed',
              streamText: '',
              streamStatus: '',
              failed: {
                tempId,
                text,
                error: error instanceof Error ? error.message : t('chat.sendFailed'),
              },
            })
          }
        } finally {
          if (controller.signal.aborted) {
            clearStream()
            set((s) => ({
              messages: s.messages.filter((m) => m.id !== tempId),
              sendStatus: 'idle',
              streamText: '',
              streamStatus: '',
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
        const { sendStatus } = get()
        if (sendStatus === 'sending' || sendStatus === 'streaming') {
          void trackExperimentEvent(
            EXPERIMENT_KEYS.streamRender,
            EXPERIMENT_EVENTS.aborted,
          ).catch(() => {})
        }
        abortCtrl?.abort()
      },

      reset: () => {
        abortCtrl?.abort()
        abortCtrl = null
        clearStream()
        lastSeq = 0
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
          streamStatus: '',
          failed: null,
        })
      },
    }
  })

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
  ensureModels: () => useInferenceSettings.getState().loadModels(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
  ensureApproval: (id) => void ensureApproval(id),
  streamRenderVariant: () => experimentVariant(EXPERIMENT_KEYS.streamRender),
})

export const isProjectConversation = (conversation: Conversation): boolean =>
  conversation.projectId != null
