import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { Conversation, Message, AiOptions, AccessMode } from './schemas'

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

export const listMessages = async (
  conversationId: string,
  params: ListParams = {},
): Promise<ListEnvelope<Message>> =>
  request(() =>
    api.get(`conversations/${conversationId}/messages`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )

export type OperationStatus =
  'QUEUED' | 'RUNNING' | 'NEEDS_INPUT' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED'

export type Operation = {
  id: string
  type: string
  applicationId: string | null
  status: OperationStatus
  progress: number | null
  result: unknown
  error: { code: string; message: string; retryable: boolean } | null
  inputRequest: {
    code: string
    message: string
    fields: { name: string; label: string; type: 'TEXT' | 'FILE' }[]
  } | null
  createdAt: string
  updatedAt: string
}


export type MessageStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'done'; operation: Operation }
  | {
      type: 'error'
      error: { code: string; message: string; details?: Record<string, unknown> }
    }

export type SendMessageBody = {
  text: string
  context: { documentId?: string; versionId?: string; evidenceIds: string[] }
  ai: AiOptions
  accessMode: AccessMode
}

export const streamMessage = async function* (
  conversationId: string,
  body: SendMessageBody,
  options: { signal?: AbortSignal; byokKey?: string } = {},
): AsyncGenerator<MessageStreamEvent> {
  let resp: Response
  try {
    resp = await api.post(`conversations/${conversationId}/messages/stream`, {
      json: body,
      headers: {
        'Idempotency-Key': newIdempotencyKey(),
        ...(options.byokKey ? { 'X-Byok-Key': options.byokKey } : {}),
      },
      timeout: false,
      signal: options.signal,
    })
  } catch (error) {
    throw await toApiError(error)
  }
  if (!resp.body) throw new ApiError('empty stream', 'NETWORK_ERROR', 0)
  const reader = resp.body.getReader()
  options.signal?.addEventListener('abort', () => void reader.cancel())
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx = buf.indexOf('\n\n')
    while (idx >= 0) {
      yield* parseFrame(buf.slice(0, idx))
      buf = buf.slice(idx + 2)
      idx = buf.indexOf('\n\n')
    }
  }
  if (buf.trim()) yield* parseFrame(buf)
}

const parseFrame = function* (frame: string): Generator<MessageStreamEvent> {
  for (const line of frame.split('\n')) {
    if (!line.startsWith('data: ')) continue
    try {
      yield JSON.parse(line.slice(6)) as MessageStreamEvent
    } catch {
      yield { type: 'error', error: { code: 'STREAM_PARSE', message: 'malformed stream frame' } }
    }
  }
}
