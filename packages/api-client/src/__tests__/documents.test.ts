import { describe, expect, it, vi } from 'vitest'
import { createClient } from '../client'
import { atDocumentRevision } from '../documents'
import { createApi } from '../endpoints'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const doc = (revision: number, status = 'DRAFT') => ({ data: { id: 'doc1', revision, status, title: 't' } })

const harness = (reply: (req: Request, body: Record<string, unknown>) => Response) => {
  const hits: string[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    const text = await req.clone().text()
    const url = new URL(req.url)
    hits.push(`${req.method} ${url.pathname}${url.search} ${text}`)
    return reply(req, text ? (JSON.parse(text) as Record<string, unknown>) : {})
  })
  const api = createApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem' }))
  return { api, hits }
}

describe('documents.archive', () => {
  it('archives a Push document through POST documents/:id/archive, never DELETE sources/:id', async () => {
    const { api, hits } = harness((req) => (req.method === 'GET' ? json(200, doc(3)) : json(200, doc(4, 'ARCHIVED'))))
    await atDocumentRevision(api.documents, 'doc1', (revision) => api.documents.archive('doc1', revision))
    expect(hits).toEqual(['GET /api/v1/documents/doc1 ', 'POST /api/v1/documents/doc1/archive {"expectedRevision":3}'])
  })

  it('retries once at the server revision on 409 REVISION_CONFLICT', async () => {
    const { api, hits } = harness((req, body) =>
      req.method === 'GET'
        ? json(200, doc(3))
        : body.expectedRevision === 5
          ? json(200, doc(6, 'ARCHIVED'))
          : json(409, { error: { code: 'REVISION_CONFLICT', message: 'resource was modified', details: { currentRevision: 5 } } }),
    )
    await atDocumentRevision(api.documents, 'doc1', (revision) => api.documents.archive('doc1', revision))
    expect(hits.slice(1)).toEqual([
      'POST /api/v1/documents/doc1/archive {"expectedRevision":3}',
      'POST /api/v1/documents/doc1/archive {"expectedRevision":5}',
    ])
  })

  it('surfaces any other failure without a retry', async () => {
    const { api, hits } = harness(() => json(404, { error: { code: 'NOT_FOUND', message: 'resource not found' } }))
    await expect(atDocumentRevision(api.documents, 'doc1', (r) => api.documents.archive('doc1', r), 2)).rejects.toMatchObject({ status: 404 })
    expect(hits).toEqual(['POST /api/v1/documents/doc1/archive {"expectedRevision":2}'])
  })

  it('renames with PATCH documents/:id and the expected revision', async () => {
    const { api, hits } = harness(() => json(200, doc(2)))
    await api.documents.rename('doc1', 1, '새 이름')
    expect(hits).toEqual(['PATCH /api/v1/documents/doc1 {"expectedRevision":1,"title":"새 이름"}'])
  })

  it('restores an archived document through POST documents/:id/restore', async () => {
    const { api, hits } = harness(() => json(200, doc(5, 'DRAFT')))
    await expect(api.documents.restore('doc 1', 4)).resolves.toMatchObject({ revision: 5, status: 'DRAFT' })
    expect(hits).toEqual(['POST /api/v1/documents/doc%201/restore {"expectedRevision":4}'])
  })

  it('lists archived documents with archived=1 and keeps the other filters', async () => {
    const page = { data: [], page: { nextCursor: null, hasMore: false } }
    const { api, hits } = harness(() => json(200, page))
    await expect(api.documents.listArchived({ limit: 20, applicationId: 'app-1', kind: 'RESUME' })).resolves.toEqual(page)
    expect(hits).toEqual(['GET /api/v1/documents?limit=20&applicationId=app-1&kind=RESUME&archived=1 '])
  })
})

describe('my posts, saved posts and the profile PDF', () => {
  it('sends sort to all three lists and the save calls to posts/:id/save', async () => {
    const { api, hits } = harness((req) => (req.method === 'GET' ? json(200, { data: [], page: { nextCursor: null, hasMore: false } }) : new Response(null, { status: 204 })))
    await api.me.posts({ sort: 'views' })
    await api.me.commentedPosts({ sort: 'comments' })
    await api.me.savedPosts()
    await api.posts.save('p1')
    await api.posts.unsave('p1')
    expect(hits.map((h) => h.trim())).toEqual([
      'GET /api/v1/me/posts?sort=views',
      'GET /api/v1/me/commented-posts?sort=comments',
      'GET /api/v1/me/saved-posts',
      'POST /api/v1/posts/p1/save',
      'DELETE /api/v1/posts/p1/save',
    ])
  })

  it('asks for the profile PDF with photo=1 only when the photo is wanted', async () => {
    const { api, hits } = harness(() => new Response('%PDF', { headers: { 'Content-Type': 'application/pdf' } }))
    await api.me.profilePdf()
    const res = await api.me.profilePdf(true)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(hits.map((h) => h.trim())).toEqual(['GET /api/v1/me/profile/pdf', 'GET /api/v1/me/profile/pdf?photo=1'])
  })
})
