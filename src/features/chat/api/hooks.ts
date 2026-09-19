import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  archiveConversation,
  createConversation,
  listConversations,
  patchConversation,
} from './fetchers'
import type { Conversation } from './schemas'

const keys = {
  list: ['conversations'] as const,
}

export const useConversations = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => listConversations({ limit: 50 }).then((env) => env.data),
  })

export const useCreateConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createConversation,
    onSuccess: (created) => {
      qc.setQueryData<Conversation[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}

export const useArchiveConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => {
      const conv = qc.getQueryData<Conversation[]>(keys.list)?.find((c) => c.id === id)
      if (!conv) throw new Error('conversation not loaded')
      return archiveConversation(id, conv.revision)
    },
    onSuccess: (_, id) => {
      qc.setQueryData<Conversation[]>(keys.list, (old) => (old ?? []).filter((c) => c.id !== id))
    },
  })
}

export const usePatchConversation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { title?: string; pinned?: boolean } }) => {
      const conv = qc.getQueryData<Conversation[]>(keys.list)?.find((c) => c.id === id)
      if (!conv) throw new Error('conversation not loaded')
      return patchConversation(id, conv.revision, patch)
    },
    onSuccess: (updated) => {
      qc.setQueryData<Conversation[]>(keys.list, (old) =>
        [...(old ?? []).map((c) => (c.id === updated.id ? updated : c))].sort(
          (a, b) => Number(b.pinned) - Number(a.pinned),
        ),
      )
    },
  })
}
