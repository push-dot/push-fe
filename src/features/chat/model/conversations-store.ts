import { create } from 'zustand'
import type { Conversation } from '@/shared/api'
import {
  archiveConversation,
  createConversation,
  listConversations,
  patchConversation,
} from '@/shared/api'

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
