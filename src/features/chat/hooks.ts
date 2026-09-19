import { create } from 'zustand'
import type { AccessMode, AiOptions, Conversation, Message } from './api-conversations'
import { archiveConversation, createConversation, listConversations, listMessages, patchConversation } from './api-conversations'
import { streamMessage } from './api-stream'
import type { AiModel } from '../settings/api'
import { fetchBilling, listAiModels } from '../settings/api'
import { useApprovalsStore } from '@/features/approval'
import { ApiError } from '@/shared/api'
import { showToast } from '@/shared/components'
import { t } from '@/shared/i18n'


type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

const BYOK_KEY_STORAGE = 'push-byok-key'
const BYOK_MODEL_STORAGE = 'push-byok-model'
const BYOK_PROVIDER_STORAGE = 'push-byok-provider'
const CREDENTIAL_MODE_STORAGE = 'push-credential-mode'

export type ByokProvider = 'OPENAI' | 'OPENROUTER' | 'GROK' | 'CLAUDE'

type InferenceSettingsState = {
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  ultraResume: boolean
  webSearch: boolean
  accessMode: AccessMode
  credentialMode: 'MANAGED' | 'BYOK'
  byokKey: string
  byokModel: string
  byokProvider: ByokProvider
  models: AiModel[]
  modelsStatus: LoadStatus
  selectedModel: string | null
  plan: string | null
  setEffort: (effort: 'LOW' | 'MEDIUM' | 'HIGH') => void
  setUltraResume: (on: boolean) => void
  setWebSearch: (on: boolean) => void
  setAccessMode: (mode: AccessMode) => void
  setCredentialMode: (mode: 'MANAGED' | 'BYOK') => void
  setByokKey: (key: string) => void
  setByokModel: (model: string) => void
  setByokProvider: (provider: ByokProvider) => void
  setModel: (model: string) => void
  loadModels: () => Promise<void>
  aiOptions: () => AiOptions | null
}

export const useInferenceSettings = create<InferenceSettingsState>()((set, get) => ({
  effort: 'MEDIUM',
  ultraResume: false,
  webSearch: false,
  accessMode: 'SUGGEST',
  credentialMode: localStorage.getItem(CREDENTIAL_MODE_STORAGE) === 'BYOK' ? 'BYOK' : 'MANAGED',
  byokKey: localStorage.getItem(BYOK_KEY_STORAGE) ?? '',
  byokModel: localStorage.getItem(BYOK_MODEL_STORAGE) ?? 'gpt-4o-mini',
  byokProvider: ((): ByokProvider => {
    const v = localStorage.getItem(BYOK_PROVIDER_STORAGE)
    return v === 'OPENROUTER' || v === 'GROK' || v === 'CLAUDE' ? v : 'OPENAI'
  })(),
  models: [],
  modelsStatus: 'idle',
  selectedModel: null,
  plan: null,
  setEffort: (effort) => set({ effort }),
  setUltraResume: (ultraResume) => set({ ultraResume }),
  setWebSearch: (webSearch) => set({ webSearch }),
  setAccessMode: (accessMode) => set({ accessMode }),
  setCredentialMode: (credentialMode) => {
    localStorage.setItem(CREDENTIAL_MODE_STORAGE, credentialMode)
    set({ credentialMode })
  },
  setByokKey: (byokKey) => {
    localStorage.setItem(BYOK_KEY_STORAGE, byokKey)
    set({ byokKey })
  },
  setByokModel: (byokModel) => {
    localStorage.setItem(BYOK_MODEL_STORAGE, byokModel)
    set({ byokModel })
  },
  setByokProvider: (byokProvider) => {
    localStorage.setItem(BYOK_PROVIDER_STORAGE, byokProvider)
    set({ byokProvider })
  },
  setModel: (selectedModel) => set({ selectedModel }),
  loadModels: async () => {
    set({ modelsStatus: 'loading' })
    void fetchBilling()
      .then((b) => {
        set((s) => ({ plan: b.plan, ultraResume: s.ultraResume && b.plan === 'ULTRA' }))
      })
      .catch(() => set({ plan: null }))
    try {
      const env = await listAiModels({
        provider: 'OPENAI',
        credentialMode: 'MANAGED',
      })
      set({ models: env.data, modelsStatus: 'success' })
    } catch {
      set({ modelsStatus: 'error' })
    }
  },
  aiOptions: () => {
    const s = get()
    if (s.credentialMode === 'BYOK') {
      if (!s.byokKey || !s.byokModel) return null
      return {
        provider: s.byokProvider,
        model: s.byokModel,
        credentialMode: 'BYOK',
        effort: s.effort,
        ultraResume: s.ultraResume,
        webSearch: s.webSearch,
      }
    }
    const model =
      s.models.find((m) => m.available && m.model === s.selectedModel) ??
      s.models.find((m) => m.available)
    if (!model) return null
    return {
      provider: 'OPENAI',
      model: model.model,
      credentialMode: 'MANAGED',
      effort: s.effort,
      ultraResume: s.ultraResume,
      webSearch: s.webSearch,
    }
  },
}))


type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

type ConversationsState = {
  items: Conversation[]
  status: LoadStatus
  error: string | null
  creating: boolean
  load: () => Promise<void>
  create: (body: { applicationId: string | null; title?: string }) => Promise<Conversation>
  archive: (id: string) => Promise<void>
  patch: (id: string, patch: { title?: string; pinned?: boolean }) => Promise<void>
}

export const useConversationsStore = create<ConversationsState>()((set, get) => ({
  items: [],
  status: 'idle',
  error: null,
  creating: false,
  load: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading', error: null })
    try {
      const env = await listConversations({ limit: 50 })
      set({ items: env.data, status: 'success' })
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'error',
      })
    }
  },
  create: async (body) => {
    if (get().creating) throw new Error('already creating')
    set({ creating: true })
    try {
      const created = await createConversation(body)
      set((s) => ({ items: [created, ...s.items] }))
      return created
    } finally {
      set({ creating: false })
    }
  },
  archive: async (id) => {
    const conv = get().items.find((c) => c.id === id)
    if (!conv) return
    await archiveConversation(id, conv.revision)
    set((s) => ({ items: s.items.filter((c) => c.id !== id) }))
  },
  patch: async (id, patch) => {
    const conv = get().items.find((c) => c.id === id)
    if (!conv) return
    const updated = await patchConversation(id, conv.revision, patch)
    set((s) => ({
      items: [...s.items.map((c) => (c.id === id ? updated : c))].sort(
        (a, b) => Number(b.pinned) - Number(a.pinned),
      ),
    }))
  },
}))

export const isProjectConversation = (conversation: Conversation): boolean =>
  conversation.projectId != null


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

  send: async (conversationId, text, evidenceIds = []) => {
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
          context: { evidenceIds },
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
