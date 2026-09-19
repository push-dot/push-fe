import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryClient } from '@/shared/api'
import { decideApproval, getApproval } from './fetchers'
import type { ApprovalSummary } from './schemas'

const keys = {
  detail: (id: string) => ['approval', id] as const,
}

export const ensureApproval = (id: string) =>
  queryClient
    .fetchQuery({ queryKey: keys.detail(id), queryFn: () => getApproval(id) })
    .then((s) => s.approval)
    .catch(() => null)

export const useApproval = (id: string) =>
  useQuery({ queryKey: keys.detail(id), queryFn: () => getApproval(id) })

export const useDecideApproval = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (decision: 'APPROVED' | 'DENIED') => {
      const cached = qc.getQueryData<ApprovalSummary>(keys.detail(id))
      if (!cached) throw new Error('approval not loaded')
      return decideApproval(id, { expectedRevision: cached.approval.revision, decision })
    },
    onSuccess: (updated) => {
      qc.setQueryData<ApprovalSummary>(keys.detail(id), (old) =>
        old ? { ...old, approval: updated } : old,
      )
    },
  })
}
