import { useQuery } from '@tanstack/react-query'
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

export const useEmployerMessages = (id: string | undefined) =>
  useQuery({
    queryKey: ['employer-messages', id],
    queryFn: () => conversationsMessages(id ?? ''),
    enabled: Boolean(id),
  })

export const useEmployerTurns = (id: string | undefined) =>
  useQuery({
    queryKey: ['employer-turns', id],
    queryFn: () => conversationsTurns(id ?? ''),
    enabled: Boolean(id),
  })
