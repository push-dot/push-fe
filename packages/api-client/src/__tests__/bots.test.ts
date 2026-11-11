import { describe, expect, it, vi } from 'vitest'
import { IDEMPOTENCY_KEY_HEADER } from '../constants'
import { createClient } from '../client'
import { createApi } from '../endpoints'
import { ApiError } from '../errors'
import type { Bot, BotLibrary } from '../types'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const bot: Bot = {
  id: 'bot-1',
  kind: 'company',
  displayName: 'Acme',
  companyId: null,
  companyName: 'Acme',
  postingId: null,
  postingUrl: null,
  avatarKey: null,
  mascotKey: null,
  notificationsMuted: false,
  revision: 2,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  lastMessagePreview: 'hello',
  unread: false,
  status: 'DONE',
}

type Harness = {
  api: ReturnType<typeof createApi>
  hits: string[]
  idem: string[]
}

const harness = (reply: (req: Request, body: Record<string, unknown>) => Response): Harness => {
  const hits: string[] = []
  const idem: string[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    const text = await req.clone().text()
    const url = new URL(req.url)
    const key = req.headers.get(IDEMPOTENCY_KEY_HEADER)
    if (key) idem.push(key)
    hits.push(`${req.method} ${url.pathname}${url.search} ${text}`)
    return reply(req, text ? (JSON.parse(text) as Record<string, unknown>) : {})
  })
  const api = createApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem-key' }))
  return { api, hits, idem }
}

const emptyLibrary: BotLibrary = {
  conversations: { items: [], nextCursor: null, hasMore: false },
  files: { items: [], nextCursor: null, hasMore: false },
  links: { items: [], nextCursor: null, hasMore: false },
}

describe('api.bots', () => {
  it('GET bots unwraps the data array', async () => {
    const { api, hits } = harness(() => json(200, { data: [bot] }))
    await expect(api.bots.list()).resolves.toEqual([bot])
    expect(hits).toEqual(['GET /api/v1/bots '])
  })

  it('POST bots sends the body and Idempotency-Key', async () => {
    const { api, hits, idem } = harness(() => json(201, { data: bot }))
    await api.bots.create({ companyName: 'Acme' })
    expect(hits).toEqual(['POST /api/v1/bots {"companyName":"Acme"}'])
    expect(idem).toEqual(['idem-key'])
  })

  it('PATCH bots sends expectedRevision and patch fields', async () => {
    const { api, hits } = harness(() => json(200, { data: { ...bot, notificationsMuted: true } }))
    await api.bots.update('bot-1', { expectedRevision: 2, notificationsMuted: true })
    expect(hits).toEqual(['PATCH /api/v1/bots/bot-1 {"expectedRevision":2,"notificationsMuted":true}'])
  })

  it('DELETE returns undefined on 204', async () => {
    const { api, hits } = harness(() => new Response(null, { status: 204 }))
    await expect(api.bots.remove('bot-1')).resolves.toBeUndefined()
    expect(hits).toEqual(['DELETE /api/v1/bots/bot-1 '])
  })

  it('GET bot conversations with limit and cursor', async () => {
    const page = { data: [], page: { nextCursor: 'n', hasMore: true } }
    const { api, hits } = harness(() => json(200, page))
    await expect(api.bots.conversations('bot-1', { limit: 50, cursor: 'abc' })).resolves.toEqual(page)
    expect(hits).toEqual(['GET /api/v1/bots/bot-1/conversations?limit=50&cursor=abc '])
  })

  it('POST bot conversation with title body', async () => {
    const conv = {
      id: 'c1',
      revision: 1,
      applicationId: null,
      title: 't',
      pinned: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    const { api, hits } = harness(() => json(201, { data: conv }))
    await expect(api.bots.createConversation('bot-1', { title: '새 대화' })).resolves.toEqual(conv)
    expect(hits).toEqual(['POST /api/v1/bots/bot-1/conversations {"title":"새 대화"}'])
  })

  it('POST link-preview parses found', async () => {
    const { api, hits } = harness(() => json(200, { data: { status: 'found', company: 'Co', title: 'Role', postingId: 'p1' } }))
    await expect(api.bots.linkPreview('https://jobs.example/a')).resolves.toMatchObject({ status: 'found' })
    expect(hits[0]).toBe('POST /api/v1/bots/link-preview {"url":"https://jobs.example/a"}')
  })

  it('POST link-preview parses not_a_posting', async () => {
    const { api } = harness(() => json(200, { data: { status: 'not_a_posting' } }))
    await expect(api.bots.linkPreview('https://example.com')).resolves.toEqual({ status: 'not_a_posting' })
  })

  it('GET company search with q, limit, cursor', async () => {
    const page = { data: [{ name: 'Acme', openPostingCount: 2 }], page: { nextCursor: null, hasMore: false } }
    const { api, hits } = harness(() => json(200, page))
    await expect(api.bots.searchCompanies('ac', { limit: 20 })).resolves.toEqual(page)
    expect(hits).toEqual(['GET /api/v1/bots/companies/search?q=ac&limit=20 '])
  })

  it('POST mark read returns readAt', async () => {
    const { api, hits } = harness(() => json(200, { data: { readAt: '2026-01-03T00:00:00Z' } }))
    await expect(api.bots.markRead('bot-1')).resolves.toEqual({ readAt: '2026-01-03T00:00:00Z' })
    expect(hits).toEqual(['POST /api/v1/bots/bot-1/read '])
  })

  it('GET library with section and file cursor', async () => {
    const { api, hits } = harness(() => json(200, { data: emptyLibrary }))
    await api.bots.library('bot-1', { limit: 50, section: 'files', fileCursor: 'cur' })
    expect(hits).toEqual(['GET /api/v1/bots/bot-1/library?limit=50&section=files&fileCursor=cur '])
  })

  it('surfaces BOT_LIMIT from 403', async () => {
    const { api } = harness(() =>
      json(403, { error: { code: 'BOT_LIMIT', message: 'limit', details: { limit: 3, plan: 'FREE' } } }),
    )
    await expect(api.bots.create({ companyName: 'X' })).rejects.toMatchObject({
      code: 'BOT_LIMIT',
      status: 403,
      details: { limit: 3, plan: 'FREE' },
    })
    await expect(api.bots.create({ companyName: 'X' })).rejects.toBeInstanceOf(ApiError)
  })

  it('surfaces DEFAULT_BOT_PROTECTED from 403', async () => {
    const { api } = harness(() =>
      json(403, { error: { code: 'DEFAULT_BOT_PROTECTED', message: 'protected', details: null } }),
    )
    await expect(api.bots.remove('push')).rejects.toMatchObject({
      code: 'DEFAULT_BOT_PROTECTED',
      status: 403,
    })
  })
})
