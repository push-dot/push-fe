import { describe, expect, it, vi } from 'vitest'
import { createClient } from '../client'
import { ApiError } from '../errors'
import { chipLabel, stageBadge } from '../labels'
import { readEvents } from '../sse'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const reqOf = (call: unknown[]) => call[0] as Request

describe('createClient', () => {
  it('adds bearer, idempotency key on POST, and comma-joins array query', async () => {
    const fetch = vi.fn(async () => json(200, { data: 1 }))
    const c = createClient({ baseUrl: 'http://x/api/v1/', getToken: () => 't', fetch, uuid: () => 'k1' })
    await c.post('postings/1/bookmark')
    await c.get('postings', { query: { category: ['dev', 'data'], q: '', limit: 20 } })
    const post = reqOf(fetch.mock.calls[0]!)
    expect(post.url).toBe('http://x/api/v1/postings/1/bookmark')
    expect(post.headers.get('Authorization')).toBe('Bearer t')
    expect(post.headers.get('Idempotency-Key')).toBe('k1')
    const get = reqOf(fetch.mock.calls[1]!)
    expect(decodeURIComponent(get.url)).toBe('http://x/api/v1/postings?category=dev,data&limit=20')
    expect(get.headers.has('Idempotency-Key')).toBe(false)
  })

  it('refreshes once on 401 and retries with the same idempotency key', async () => {
    let token = 'old'
    const bodies: string[] = []
    const replies = [json(401, { error: { code: 'TOKEN_EXPIRED', message: 'x' } }), json(201, { data: { ok: true } })]
    // Read the body at send time: the retry must resend the same JSON.
    const fetch = vi.fn(async (req: RequestInfo | URL) => (bodies.push(await (req as Request).clone().text()), replies.shift()!))
    const refresh = vi.fn(async () => ((token = 'new'), true))
    const c = createClient({ baseUrl: 'http://x', getToken: () => token, refresh, fetch, uuid: () => 'k2' })
    await expect(c.post('posts', { body: { a: 1 } })).resolves.toEqual({ data: { ok: true } })
    expect(refresh).toHaveBeenCalledTimes(1)
    const retry = reqOf(fetch.mock.calls[1]!)
    expect(retry.headers.get('Authorization')).toBe('Bearer new')
    expect(retry.headers.get('Idempotency-Key')).toBe('k2')
    expect(bodies).toEqual(['{"a":1}', '{"a":1}'])
  })

  it('throws ApiError with server code', async () => {
    const fetch = vi.fn(async () => json(409, { error: { code: 'CONFLICT', message: 'dup', details: null } }))
    const c = createClient({ baseUrl: 'http://x', getToken: () => null, fetch })
    await expect(c.post('profiles/u/offer', { body: {} })).rejects.toMatchObject({ code: 'CONFLICT', status: 409 })
    await expect(c.post('profiles/u/offer', { body: {} })).rejects.toBeInstanceOf(ApiError)
  })
})

describe('readEvents', () => {
  it('parses frames split across chunks and flags malformed data', async () => {
    const enc = new TextEncoder()
    const chunks = ['retry: 400\n\nid: 1\ndata: {"type":"tok', 'en","text":"안"}\n\ndata: {bad}\n\n', 'data: {"type":"status","text":"끝"}']
    const body = new ReadableStream<Uint8Array>({
      start(ctrl) {
        for (const c of chunks) ctrl.enqueue(enc.encode(c))
        ctrl.close()
      },
    })
    const out = []
    for await (const e of readEvents(body)) out.push(e)
    expect(out).toEqual([
      { type: 'token', text: '안' },
      { type: 'error', error: { code: 'STREAM_PARSE', message: 'malformed stream frame' } },
      { type: 'status', text: '끝' },
    ])
  })
})

describe('labels', () => {
  it('formats multi-select chip labels', () => {
    expect(chipLabel('직군', [])).toBe('직군')
    expect(chipLabel('직군', ['개발'])).toBe('개발')
    expect(chipLabel('직군', ['개발', '데이터'])).toBe('개발 외 1')
  })
  it('maps stages to design badges', () => {
    expect(stageBadge('SCREENING')).toBe('서류')
    expect(stageBadge('OFFER')).toBe('합격')
  })
})
