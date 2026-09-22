import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import {
  archiveConversation,
  createConversation,
  listConversations,
  listMessages,
  patchConversation,
} from './fetchers'
import type { Conversation } from './schemas'
import { MESSAGES_PAGE_SIZE } from '../constants'

export const chatKeys = {
  list: ['conversations'] as const,
  messages: (id: string) => ['chat-messages', id] as const,
}

const conversationsQuery = {
  queryKey: chatKeys.list,
  queryFn: () => listConversations({ limit: 50 }).then((env) => env.data),
}

export const useConversations = () => useQuery(conversationsQuery)

export const prefetchConversations = () => prefetchList(conversationsQuery)

export const prefetchMessages = (conversationId: string) =>
  prefetchList({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => listMessages(conversationId, { limit: MESSAGES_PAGE_SIZE }),
  })

export const useCreateConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createConversation,
    onSuccess: (created) => {
      qc.setQueryData<Conversation[]>(chatKeys.list, (old) => [created, ...(old ?? [])])
    },
  })
}

export const useArchiveConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      const conv = qc.getQueryData<Conversation[]>(chatKeys.list)?.find((c) => c.id === id)
      if (!conv) throw new Error('conversation not loaded')
      return archiveConversation(id, conv.revision)
    },
    onSuccess: (_, id) => {
      qc.setQueryData<Conversation[]>(chatKeys.list, (old) =>
        (old ?? []).filter((c) => c.id !== id),
      )
    },
  })
}

export const usePatchConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { title?: string; pinned?: boolean } }) => {
      const conv = qc.getQueryData<Conversation[]>(chatKeys.list)?.find((c) => c.id === id)
      if (!conv) throw new Error('conversation not loaded')
      return patchConversation(id, conv.revision, patch)
    },
    onSuccess: (updated) => {
      qc.setQueryData<Conversation[]>(chatKeys.list, (old) =>
        [...(old ?? []).map((c) => (c.id === updated.id ? updated : c))].sort(
          (a, b) => Number(b.pinned) - Number(a.pinned),
        ),
      )
    },
  })
}
