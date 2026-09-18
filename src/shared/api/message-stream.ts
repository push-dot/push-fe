import { API_BASE_URL } from '../constants'
import { getAccessToken } from '../auth/session'
import { newIdempotencyKey } from '../lib/id'
import { ApiError } from './envelope'
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
  options: { signal?: AbortSignal } = {},
): AsyncGenerator<MessageStreamEvent> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Idempotency-Key': newIdempotencyKey(),
  }
  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const resp = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: options.signal ?? null,
  })
  if (!resp.ok) {
    const body = (await resp.json().catch(() => null)) as {
      error?: { code?: string; message?: string; details?: Record<string, unknown> }
    } | null
    throw new ApiError(
      body?.error?.message ?? 'request failed',
      body?.error?.code ?? 'HTTP_ERROR',
      resp.status,
      body?.error?.details,
    )
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
