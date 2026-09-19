import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { Conversation } from './schemas'

export const listConversations = async (
  params: ListParams & { applicationId?: string } = {},
): Promise<ListEnvelope<Conversation>> =>
  request(() =>
    api.get('conversations', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const createConversation = async (body: {
  applicationId: string | null
  title?: string
}): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.post('conversations', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const patchConversation = async (
  id: string,
  expectedRevision: number,
  patch: { title?: string; pinned?: boolean },
): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.patch(`conversations/${id}`, {
      json: { expectedRevision, ...patch },
    }),
  )
  return env.data
}

export const archiveConversation = async (
  id: string,
  expectedRevision: number,
): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.post(`conversations/${id}/archive`, {
      json: { expectedRevision },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}
