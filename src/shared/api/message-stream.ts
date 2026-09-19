import { api } from './client'
import { ApiError, toApiError } from './envelope'
import { newIdempotencyKey } from '../lib/id'
import type { AccessMode, AiOptions, Operation } from './conversations'

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
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx = buf.indexOf('\n\n')
    while (idx >= 0) {
      const frame = buf.slice(0, idx)
      buf = buf.slice(idx + 2)
      for (const line of frame.split('\n')) {
        if (line.startsWith('data: ')) {
          yield JSON.parse(line.slice(6)) as MessageStreamEvent
        }
      }
      idx = buf.indexOf('\n\n')
    }
  }
}
