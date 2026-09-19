import { api, ApiError, toApiError } from '@/shared/api'
import { request } from '@/shared/api'
import type { ListEnvelope, ListParams, Operation } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { AccessMode, AiOptions } from '@/features/inference'
import type { Message } from './schemas'

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
