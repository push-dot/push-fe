import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createBotApi, type BotApi } from '../bot-api'
import type * as BotContract from '../bot-contract'
import { createClient } from '../client'
import { IDEMPOTENCY_KEY_HEADER } from '../constants'
import { ApiError } from '../errors'
import type { AppNotification, BillingStatus, LinkKind } from '../types'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const noContent = () => new Response(null, { status: 204 })

const sse = (...events: object[]) =>
  new Response(events.map((event) => `id: ${'seq' in event ? event.seq : ''}\ndata: ${JSON.stringify(event)}\n\n`).join(''), { status: 200 })

type Hit = { line: string; idempotencyKey: string | null; accept: string | null }

const harness = (reply: (hit: Hit) => Response) => {
  const hits: Hit[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    const url = new URL(req.url)
    const body = await req.clone().text()
    const hit = {
      line: `${req.method} ${url.pathname}${decodeURIComponent(url.search)}${body ? ` ${body}` : ''}`,
      idempotencyKey: req.headers.get(IDEMPOTENCY_KEY_HEADER),
      accept: req.headers.get('Accept'),
    }
    hits.push(hit)
    return reply(hit)
  })
  const api = createBotApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem-key' }))
  return { api, hits }
}

const collect = async <T>(events: AsyncGenerator<T>) => {
  const out: T[] = []
  for await (const event of events) out.push(event)
  return out
}

const bot: BotContract.Bot = {
  id: 'b1',
  kind: 'company',
  displayName: '모아페이',
  companyName: '모아페이',
  color: 'teal',
  postingId: 'p1',
  notificationsMuted: false,
  revision: 2,
  createdAt: '2026-11-01T00:00:00Z',
  lastActivityAt: '2026-11-12T09:50:00Z',
  lastMessage: { preview: '이 변경을 이력서에 반영할까요?', at: '2026-11-12T09:50:00Z', fromBot: true },
  unread: true,
  activity: { phase: 'waiting', since: '2026-11-12T09:50:00Z', for: 'confirm', cardId: 'c1', cardTitle: '이력서 수정', expiresAt: null },
  outcome: null,
}

const limit: BotContract.BotLimit = { plan: 'FREE', max: 3, used: 1, table: { FREE: 3, PRO: 20, ULTRA: null } }

const detail: BotContract.BotDetail = {
  ...bot,
  posting: { id: 'p1', title: '백엔드 엔지니어', deadline: null, closed: false },
  fit: { score: 81 },
}

const search: BotContract.BotSearch = {
  bots: [{ ...bot, line: '모아페이 · 백엔드 엔지니어' }],
  botTotal: 1,
  messages: [{ bot: { id: 'b1', kind: 'company', displayName: '모아페이', color: 'teal' }, messageId: 'm1', at: '2026-11-12T09:00:00Z', role: 'ASSISTANT', snippet: '…이력서를 고쳤어요' }],
  messageTotal: 1,
}

const found: BotContract.LinkPreview = {
  status: 'found', postingId: 'p1', company: '모아페이', title: '백엔드 엔지니어',
  deadline: '2026-11-30', careerMin: 3, careerMax: null, location: '서울', host: 'jobs.example',
}

const transcript: BotContract.Transcript = {
  data: [
    {
      id: 't2',
      status: 'RUNNING',
      createdAt: '2026-11-12T09:49:00Z',
      user: { messageId: 'm3', text: '이력서 고쳐 줘', attachments: [{ kind: 'document', id: 'd1', title: '이력서' }] },
      answer: null,
      events: [
        { type: 'status', text: '공고 요건을 읽는 중', phase: 'working', since: '2026-11-12T09:49:00Z', seq: 11, at: '2026-11-12T09:49:02Z' },
        {
          type: 'approval', id: 'c1', kind: 'TOOL_ACTION', title: '이 페이지를 열어도 될까요?',
          options: [{ id: 'approve', label: '한 번 허용' }, { id: 'approve_always', label: '항상 허용' }, { id: 'reject', label: '거절' }],
          resolution: { status: 'PENDING', optionId: null }, openedAt: '2026-11-12T09:50:00Z', expiresAt: '2026-11-12T10:00:00Z', retryable: true,
          seq: 12, at: '2026-11-12T09:50:00Z',
        },
      ],
      assistant: null,
    },
  ],
  page: { nextCursor: 'older', hasMore: true },
  live: { turnId: 't2', lastSeq: 12 },
}

const matches: BotContract.TranscriptMatches = { total: 1, items: [{ messageId: 'm1', turnId: 't1', at: '2026-11-12T09:00:00Z' }] }

const retried: BotContract.CardRetry = { id: 'c1', status: 'PENDING', openedAt: '2026-11-12T10:05:00Z', expiresAt: '2026-11-12T10:15:00Z' }

const file: BotContract.Material = {
  kind: 'file', id: 'f1', title: '이력서.pdf', mimeType: 'application/pdf', size: 1024, pageCount: 2,
  origin: 'AI', createdBy: null, updatedAt: '2026-11-02T00:00:00Z',
}

const materials: BotContract.MaterialsPage = {
  counts: { doc: 8, bookmark: 6, link: 10 },
  sections: [{ section: 'doc', items: [file], nextCursor: 'next' }],
}

const material: BotContract.MaterialDetail = { ...file, usedBy: [{ id: 'push-id', kind: 'push', displayName: 'Push Bot', color: null }] }

const linkedin: BotContract.Material = {
  kind: 'link', id: 'l1', title: 'https://www.linkedin.com/in/seojun', url: 'https://www.linkedin.com/in/seojun', host: 'www.linkedin.com',
  linkKind: 'other', addedAt: '2026-09-02T02:00:00Z', lastCheckedAt: null, lastCheckOk: null,
}

const botMaterials: BotContract.MaterialsPage = {
  counts: { doc: 4, bookmark: 1, link: 3 },
  sections: [{ section: 'link', items: [linkedin], nextCursor: null }],
}

describe('createBotApi routes', () => {
  const cases: [name: string, call: (api: BotApi) => Promise<unknown>, reply: Response, line: string, result: unknown][] = [
    ['list', (api) => api.bots.list(), json(200, { data: [bot], limit }), 'GET /api/v1/bots', { data: [bot], limit }],
    ['list by posting', (api) => api.bots.list({ postingId: 'p1' }), json(200, { data: [bot] }), 'GET /api/v1/bots?postingId=p1', { data: [bot] }],
    [
      'search', (api) => api.bots.search('모아', { limit: 20, cursor: 'c' }), json(200, { data: search, page: { nextCursor: null, hasMore: false } }),
      'GET /api/v1/bots/search?q=모아&limit=20&cursor=c', { data: search, page: { nextCursor: null, hasMore: false } },
    ],
    [
      'linkPreview', (api) => api.bots.linkPreview('https://jobs.example/a'), json(200, { data: found }),
      'POST /api/v1/bots/link-preview {"url":"https://jobs.example/a"}', found,
    ],
    ['get', (api) => api.bots.get('push'), json(200, { data: detail }), 'GET /api/v1/bots/push', detail],
    [
      'update', (api) => api.bots.update('b1', { expectedRevision: 2, color: 'sky' }), json(200, { data: bot }),
      'PATCH /api/v1/bots/b1 {"expectedRevision":2,"color":"sky"}', bot,
    ],
    ['remove', (api) => api.bots.remove('b1'), noContent(), 'DELETE /api/v1/bots/b1', undefined],
    ['markRead', (api) => api.bots.markRead('push'), json(200, { data: { readAt: '2026-11-12T10:00:00Z' } }), 'POST /api/v1/bots/push/read', { readAt: '2026-11-12T10:00:00Z' }],
    [
      'transcript', (api) => api.bots.transcript('push', { cursor: 'older', limit: 30 }), json(200, transcript),
      'GET /api/v1/bots/push/transcript?cursor=older&limit=30', transcript,
    ],
    ['clearChat', (api) => api.bots.clearChat('push'), noContent(), 'DELETE /api/v1/bots/push/transcript', undefined],
    ['findInChat', (api) => api.bots.findInChat('b1', '이력서'), json(200, { data: matches }), 'GET /api/v1/bots/b1/transcript/matches?q=이력서', matches],
    [
      'cancel', (api) => api.bots.cancel('b1'), json(200, { data: { status: 'CANCELLED', resumable: true } }),
      'POST /api/v1/bots/b1/stream/cancel', { status: 'CANCELLED', resumable: true },
    ],
    ['retryCard', (api) => api.bots.retryCard('b1', 'c1'), json(200, { data: retried }), 'POST /api/v1/bots/b1/approvals/c1/retry', retried],
    [
      'materials.list', (api) => api.materials.list({ tab: 'doc', q: '이력', limit: 20 }), json(200, { data: materials }),
      'GET /api/v1/materials?tab=doc&q=이력&limit=20', materials,
    ],
    [
      'materials.list of one bot', (api) => api.materials.list({ bot: 'push' }), json(200, { data: botMaterials }),
      'GET /api/v1/materials?bot=push', botMaterials,
    ],
    ['materials.get', (api) => api.materials.get('file', 'f1'), json(200, { data: material }), 'GET /api/v1/materials/file/f1', material],
    ['materials.remove', (api) => api.materials.remove('link', 'l1'), noContent(), 'DELETE /api/v1/materials/link/l1', undefined],
    ['materials.restore', (api) => api.materials.restore('link', 'l1'), json(200, { data: linkedin }), 'POST /api/v1/materials/link/l1/restore', linkedin],
  ]

  it.each(cases)('%s sends its contract request and returns the body the app reads', async (_name, call, reply, line, result) => {
    const { api, hits } = harness(() => reply)
    await expect(call(api)).resolves.toEqual(result)
    expect(hits.map((hit) => hit.line)).toEqual([line])
  })
})

describe('createBotApi create and card answer', () => {
  it('reports a new bot on 201 and an existing one on 200', async () => {
    const made = harness(() => json(201, { data: bot }))
    await expect(made.api.bots.create({ postingId: 'p1', displayName: '모아페이', color: 'teal' })).resolves.toEqual({ bot, created: true })
    expect(made.hits).toMatchObject([
      { line: 'POST /api/v1/bots {"postingId":"p1","displayName":"모아페이","color":"teal"}', idempotencyKey: 'idem-key' },
    ])

    const existing = harness(() => json(200, { data: bot }))
    await expect(existing.api.bots.create({ postingId: 'p2' })).resolves.toEqual({ bot, created: false })
  })

  it('surfaces the plan limit of a refused create', async () => {
    const { api } = harness(() => json(403, { error: { code: 'BOT_LIMIT', message: 'limit', details: { limit: 3, plan: 'FREE' } } }))
    const refused = api.bots.create({ postingId: 'p1' })
    await expect(refused).rejects.toBeInstanceOf(ApiError)
    await expect(refused).rejects.toMatchObject({ code: 'BOT_LIMIT', status: 403, details: { limit: 3, plan: 'FREE' } })
  })

  it('reports whether a card answer resumed the run', async () => {
    const answer: BotContract.CardAnswer = { id: 'c1', status: 'APPROVED', optionId: 'approve_always' }
    const resumed = harness(() => json(202, { data: answer }))
    await expect(resumed.api.bots.answer('b1', 'c1', { optionId: 'approve_always' })).resolves.toEqual({ answer, resumed: true })
    expect(resumed.hits).toMatchObject([
      { line: 'POST /api/v1/bots/b1/approvals/c1 {"optionId":"approve_always"}', idempotencyKey: 'idem-key' },
    ])

    const closed = harness(() => json(200, { data: { ...answer, status: 'REJECTED', optionId: 'reject' } }))
    await expect(closed.api.bots.answer('b1', 'c1', { optionIds: ['reject'] })).resolves.toMatchObject({ resumed: false })
    expect(closed.hits[0]?.line).toBe('POST /api/v1/bots/b1/approvals/c1 {"optionIds":["reject"]}')
  })
})

describe('createBotApi streams', () => {
  const stamp = { at: '2026-11-12T09:49:00Z', turn: 't2' }
  const queued: BotContract.StreamEvent = { type: 'status', text: '대기 중', phase: 'queued', since: '2026-11-12T09:49:00Z', ahead: 2, seq: 1, ...stamp }
  const token: BotContract.StreamEvent = { type: 'token', text: '네, ', seq: 2, ...stamp }
  const done: BotContract.StreamEvent = { type: 'done', operation: null, sources: [{ kind: 'posting', id: 'p1', title: '백엔드 엔지니어' }], seq: 3, ...stamp }
  const cancelled: BotContract.StreamEvent = { type: 'cancelled', resumable: true, seq: 3, ...stamp }

  it('sends a message to the bot and yields its frames in order', async () => {
    const { api, hits } = harness(() => sse(queued, token, done))
    const body: BotContract.SendBody = { text: '이력서 고쳐 줘', attachments: [{ kind: 'document', id: 'd1' }], intent: 'match_posting' }
    await expect(collect(api.bots.send('push', body))).resolves.toEqual([queued, token, done])
    expect(hits).toEqual([
      {
        line: 'POST /api/v1/bots/push/messages/stream {"text":"이력서 고쳐 줘","attachments":[{"kind":"document","id":"d1"}],"intent":"match_posting"}',
        idempotencyKey: null,
        accept: 'text/event-stream',
      },
    ])
  })

  it('rejects a send with the server error before any frame', async () => {
    const { api } = harness(() => json(409, { error: { code: 'ATTACHMENT_GONE', message: 'gone', details: { kind: 'file', id: 'f1' } } }))
    await expect(collect(api.bots.send('b1', { text: 'x', attachments: [{ kind: 'file', id: 'f1' }] }))).rejects.toMatchObject({
      code: 'ATTACHMENT_GONE',
      status: 409,
      details: { kind: 'file', id: 'f1' },
    })
  })

  it('follows a run from the last seq, reattaches after a dropped stream, and stops at the terminal frame', async () => {
    const replies = [sse(token), sse(), sse(cancelled)]
    const { api, hits } = harness(() => replies.shift() ?? noContent())
    await expect(collect(api.bots.follow('b1', 1))).resolves.toEqual([token, cancelled])
    expect(hits.map((hit) => hit.line)).toEqual([
      'GET /api/v1/bots/b1/stream?after=1',
      'GET /api/v1/bots/b1/stream?after=2',
      'GET /api/v1/bots/b1/stream?after=2',
    ])
    expect(hits[0]?.accept).toBe('text/event-stream')
  })

  it('yields no terminal frame when the server says nothing runs', async () => {
    const replies = [sse(token)]
    const { api, hits } = harness(() => replies.shift() ?? noContent())
    await expect(collect(api.bots.follow('push'))).resolves.toEqual([token])
    expect(hits.map((hit) => hit.line)).toEqual(['GET /api/v1/bots/push/stream', 'GET /api/v1/bots/push/stream?after=2'])
  })

  it('does not read a stream without a body as a run that ended', async () => {
    const { api } = harness(() => new Response(null, { status: 200 }))
    await expect(collect(api.bots.follow('b1', 1))).rejects.toMatchObject({ code: 'NETWORK_ERROR' })
  })
})

describe('bot contract types', () => {
  it('leaves no fact of a bot optional', () => {
    expectTypeOf<Required<BotContract.Bot>>().toEqualTypeOf<BotContract.Bot>()
    // @ts-expect-error a working bot has a sentence
    const working: BotContract.BotActivity = { phase: 'working', since: '2026-11-12T09:49:00Z' }
    void working
  })

  it('gives each status phase its own facts', () => {
    type Status = Extract<BotContract.StreamEvent, { type: 'status' }>
    expectTypeOf<Extract<Status, { phase: 'queued' }>['ahead']>().toBeNumber()
    expectTypeOf<Extract<Status, { phase: 'waiting' }>['cardId']>().toBeString()
    expectTypeOf<Status['phase']>().toEqualTypeOf<'queued' | 'thinking' | 'working' | 'waiting'>()
    expectTypeOf<Extract<BotContract.StreamEvent, { type: 'cancelled' }>['resumable']>().toBeBoolean()
  })

  it('stamps every live frame except an error the stream raised itself', () => {
    expectTypeOf<Extract<BotContract.StreamEvent, { type: 'token' }>['turn']>().toBeString()
    expectTypeOf<Extract<BotContract.StreamEvent, { type: 'done' }>['seq']>().toBeNumber()
    expectTypeOf<Extract<BotContract.StreamEvent, { type: 'error' }>['turn']>().toEqualTypeOf<string | undefined>()
  })

  it('stores a card with the facts of its row and never stores done', () => {
    type Card = Extract<BotContract.TurnEvent, { type: 'approval' | 'choice' }>
    expectTypeOf<Card['retryable']>().toBeBoolean()
    expectTypeOf<Card['expiresAt']>().toEqualTypeOf<string | null>()
    expectTypeOf<Extract<BotContract.TurnEvent, { type: 'done' }>>().toBeNever()
    expectTypeOf<Extract<BotContract.StreamEvent, { type: 'approval' }>['expiresAt']>().toEqualTypeOf<string | undefined>()
  })

  it('sends only the personal intents', () => {
    expectTypeOf<BotContract.Intent>().toEqualTypeOf<
      | 'match_posting' | 'fit' | 'gaps' | 'experience' | 'boost' | 'find_postings' | 'deadline_postings'
      | 'applications' | 'calendar' | 'hub_profile' | 'offer_reply' | 'coffee_chat' | 'career_post'
    >()
    // @ts-expect-error an employer intent is not a bot intent
    const body: BotContract.SendBody = { text: 'x', intent: 'review' }
    void body
  })

  it('marks LinkedIn from the host, never as a link kind', () => {
    type Link = Extract<BotContract.Material, { kind: 'link' }>
    expectTypeOf<Link['host']>().toBeString()
    expectTypeOf<Link['linkKind']>().toEqualTypeOf<LinkKind>()
    // @ts-expect-error LinkedIn is not a kind a link is stored or listed with
    const kind: Link['linkKind'] = 'linkedin'
    void kind
  })

  it('adds the bot target and an optional refill date to the existing types', () => {
    expectTypeOf<'bot'>().toExtend<AppNotification['target']['kind']>()
    expectTypeOf<BillingStatus['creditsRefillAt']>().toEqualTypeOf<string | undefined>()
  })
})

describe('bot list outcome', () => {
  it('carries the expired and failed states push-be sends on a bot', async () => {
    const outcomes: BotContract.BotOutcome[] = [
      { kind: 'expired', at: '2026-11-13T00:00:00Z' },
      { kind: 'failed', at: '2026-11-13T00:01:00Z' },
    ]
    expectTypeOf<BotContract.Bot['outcome']>().toEqualTypeOf<BotContract.BotOutcome | null>()
    const bot = (outcome: BotContract.BotOutcome | null) => ({ id: 'b', outcome }) as BotContract.Bot
    const { api } = harness(() => json(200, { data: outcomes.map(bot) }))
    const list = await api.bots.list()
    expect(list.data.map((b) => b.outcome?.kind)).toEqual(['expired', 'failed'])
  })
})

describe('BotSiteGrant', () => {
  it('matches the row GET /bots/{id}/site-grants sends', () => {
    expectTypeOf<BotContract.BotSiteGrant>().toEqualTypeOf<{
      host: string
      kind: 'posting' | 'company' | 'other'
      grantedAt: string
    }>()
  })
})
