import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList, queryClient } from '@/shared/api'
import {
  archiveConversation,
  createConversation,
  decideApproval,
  getApproval,
  listConversations,
  listMessages,
  listProjectEvidence,
  listProjectRuns,
  patchConversation,
} from './fetchers'
import type { ApprovalSummary, CliRun, Conversation, ProjectEvidence } from './schemas'
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

export const useConversationPeek = () =>
  useMutation({
    mutationFn: (conversationId: string) => listMessages(conversationId, { limit: 1 }),
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

const approvalKeys = {
  detail: (id: string) => ['approval', id] as const,
}

export const ensureApproval = (id: string) =>
  queryClient
    .fetchQuery({ queryKey: approvalKeys.detail(id), queryFn: () => getApproval(id) })
    .then((s) => s.approval)
    .catch(() => null)

export const useApproval = (id: string) =>
  useQuery({ queryKey: approvalKeys.detail(id), queryFn: () => getApproval(id) })

export const useDecideApproval = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (decision: 'APPROVED' | 'DENIED') => {
      const cached = qc.getQueryData<ApprovalSummary>(approvalKeys.detail(id))
      if (!cached) throw new Error('approval not loaded')
      return decideApproval(id, { expectedRevision: cached.approval.revision, decision })
    },
    onSuccess: (updated) => {
      qc.setQueryData<ApprovalSummary>(approvalKeys.detail(id), (old) =>
        old ? { ...old, approval: updated } : old,
      )
    },
  })
}

const projectKeys = {
  panels: (projectId: string) => ['project-panels', projectId] as const,
}

export type ProjectPanelsData = {
  runs: CliRun[]
  evidence: ProjectEvidence[]
}

export const useProjectPanels = (projectId: string | undefined) =>
  useQuery({
    queryKey: projectKeys.panels(projectId ?? ''),
    enabled: Boolean(projectId),
    queryFn: async (): Promise<ProjectPanelsData> => {
      const [runs, evidence] = await Promise.all([
        listProjectRuns(projectId!, { limit: 20 }),
        listProjectEvidence(projectId!, { limit: 20 }),
      ])
      return { runs: runs.data, evidence: evidence.data }
    },
  })
