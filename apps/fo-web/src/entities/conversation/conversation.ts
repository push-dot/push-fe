import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  conversationsList as fetchConversations,
  conversationsMessages as fetchMessages,
  conversationsTurns as fetchTurns,
} from '../../shared/api/operations'

export const conversationsList = (...args: Parameters<typeof fetchConversations>) => fetchConversations(...args)
export const conversationsMessages = (...args: Parameters<typeof fetchMessages>) => fetchMessages(...args)
export const conversationsTurns = (...args: Parameters<typeof fetchTurns>) => fetchTurns(...args)

export const useEmployerConversations = () =>
  useQuery({ queryKey: ['employer-conversations'], queryFn: () => conversationsList({ audience: 'EMPLOYER' }) })

const olderPage = (last: { page: { hasMore: boolean; nextCursor: string | null } }) =>
  last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined

/** Newest first, one page per scroll back to the top: push-be pages messages and jobs by cursor. */
export const useEmployerMessages = (id: string | undefined) =>
  useInfiniteQuery({
    queryKey: ['employer-messages', id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => conversationsMessages(id ?? '', { cursor: pageParam }),
    getNextPageParam: olderPage,
    enabled: Boolean(id),
  })

export const useEmployerTurns = (id: string | undefined) =>
  useInfiniteQuery({
    queryKey: ['employer-turns', id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => conversationsTurns(id ?? '', { cursor: pageParam }),
    getNextPageParam: olderPage,
    enabled: Boolean(id),
  })
