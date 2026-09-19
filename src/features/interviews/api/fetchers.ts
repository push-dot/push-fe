import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { AiOptions } from '@/features/inference'
import type { Operation } from '@/shared/api'
import type { InterviewSession } from './schemas'

export const listInterviews = async (
  params: ListParams & { applicationId?: string } = {},
): Promise<ListEnvelope<InterviewSession>> =>
  request(() =>
    api.get('interviews', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const createInterview = async (body: {
  applicationId: string
  title: string
  scheduledAt: string
  durationMinutes?: number
  evidenceIds?: string[]
  notes?: string
}): Promise<InterviewSession> => {
  const env = await request<DataEnvelope<InterviewSession>>(() =>
    api.post('interviews', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const prepareInterview = async (
  id: string,
  body: { expectedRevision: number; ai: AiOptions | null },
): Promise<Operation> => {
  const env = await request<DataEnvelope<Operation>>(() =>
    api.post(`interviews/${id}/prepare`, {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}
