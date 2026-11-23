import { describe, expect, it, vi } from 'vitest'
import type { A2uiVersion } from '../a2ui'
import { createBotApi } from '../bot-api'
import { createClient } from '../client'
import { createApi } from '../endpoints'

const reply = (url: string) =>
  url.includes('/stream')
    ? new Response('data: {"type":"done","operation":null,"seq":1}\n\n', { status: 200 })
    : new Response(JSON.stringify({ data: [], page: { nextCursor: null, hasMore: false }, live: null }), { status: 200, headers: { 'Content-Type': 'application/json' } })

const harness = (a2uiVersion?: A2uiVersion) => {
  const seen: { url: string; version: string | null }[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    seen.push({ url: new URL(req.url).pathname, version: req.headers.get('A2UI-Version') })
    return reply(req.url)
  })
  const client = createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem', a2uiVersion })
  return { api: createApi(client), bot: createBotApi(client).bots, seen }
}

const drain = async (events: AsyncIterable<unknown>) => {
  for await (const _ of events) void _
}

const calls = async ({ api, bot }: ReturnType<typeof harness>) => {
  await drain(bot.send('b1', { text: '안녕' }))
  await drain(bot.follow('b1'))
  await bot.transcript('b1')
  await drain(api.conversations.stream('c1', { text: '안녕', accessMode: 'AUTO' }))
  await drain(api.conversations.follow('c1'))
  await drain(api.conversations.active('c1'))
  await api.conversations.turns('c1')
  await bot.get('b1').catch(() => undefined)
}

const FRAME_PATHS = [
  '/api/v1/bots/b1/messages/stream',
  '/api/v1/bots/b1/stream',
  '/api/v1/bots/b1/transcript',
  '/api/v1/conversations/c1/messages/stream',
  '/api/v1/conversations/c1/messages/stream/active',
  '/api/v1/conversations/c1/messages/stream/active',
  '/api/v1/conversations/c1/turns',
]

describe('A2UI-Version header', () => {
  it.each(['1.0', 'v0.9.1'] as const)('sends %s on every request that returns frames, and only there', async (version) => {
    const h = harness(version)
    await calls(h)
    expect(h.seen).toEqual([...FRAME_PATHS.map((url) => ({ url, version })), { url: '/api/v1/bots/b1', version: null }])
  })

  it('sends no header when the client sets no version', async () => {
    const h = harness()
    await calls(h)
    expect(h.seen.map((s) => s.version)).toEqual(Array(FRAME_PATHS.length + 1).fill(null))
  })
})
