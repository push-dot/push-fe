import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import type { ApprovalStatus, Approval, ApprovalSummary } from './schemas'

export const getApproval = async (id: string): Promise<ApprovalSummary> =>
  request(() => api.get(`approvals/${id}`))

export const listApprovals = async (
  params: ListParams & { applicationId?: string; status?: ApprovalStatus } = {},
): Promise<ListEnvelope<Approval>> =>
  request(() =>
    api.get('approvals', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    }),
  )

export const decideApproval = async (
  id: string,
  body: { expectedRevision: number; decision: 'APPROVED' | 'DENIED' },
): Promise<Approval> => {
  const env = await request<DataEnvelope<Approval>>(() =>
    api.post(`approvals/${id}/decision`, { json: body }),
  )
  return env.data
}
