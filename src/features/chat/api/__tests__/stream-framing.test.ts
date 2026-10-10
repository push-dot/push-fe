import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...mod,
    api: { get: vi.fn(), post: vi.fn() },
  }
})

import { api } from '@/shared/api'
import { streamActive } from '../fetchers'

const sseResponse = (
  enqueue: (controller: ReadableStreamDefaultController<Uint8Array>) => void,
  onCancel?: () => void,
) =>
  new Response(
    new ReadableStream<Uint8Array>({
      start: enqueue,
      cancel: onCancel,
    }),
    { status: 200 },
  )

const encode = (s: string) => new TextEncoder().encode(s)

describe('SSE framing', () => {
  it('yields events framed by CRLF separators without waiting for EOF', async () => {
    vi.mocked(api.get).mockResolvedValue(
      sseResponse((c) => {
        c.enqueue(encode('data: {"type":"token","text":"a","seq":1}\r\n\r\n'))
      }) as never,
    )
    const events = streamActive('c1')
    const first = await Promise.race([
      events.next(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timed out waiting for event')), 2_000),
      ),
    ])
    expect(first.value).toMatchObject({ type: 'token', text: 'a' })
    await events.return(undefined)
  })

  it('cancels the reader when the consumer stops early', async () => {
    const cancel = vi.fn()
    vi.mocked(api.get).mockResolvedValue(
      sseResponse((c) => {
        c.enqueue(encode('data: {"type":"token","text":"a","seq":1}\n\n'))
        c.enqueue(encode('data: {"type":"token","text":"b","seq":2}\n\n'))
      }, cancel) as never,
    )
    const events = streamActive('c1')
    await events.next()
    await events.return(undefined)
    await vi.waitFor(() => expect(cancel).toHaveBeenCalled())
  })
})
