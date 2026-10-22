import { describe, expect, it, vi } from 'vitest'
import { createClient } from '../client'
import { createApi } from '../endpoints'
import { QueueBusyError } from '../errors'
import { isJobSettled, jobQuery } from '../jobs'
import { parseFrame } from '../sse'
import type { QueueJob, StreamEvent } from '../types'

const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } })

type Hit = { method: string; url: string; body: string }

const harness = (reply: (req: Request) => Response = () => json(200, { data: null })) => {
  const hits: Hit[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    hits.push({ method: req.method, url: req.url, body: await req.clone().text() })
    return reply(req)
  })
  const api = createApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem' }))
  return { api, hits }
}

const frame = (event: unknown) => [...parseFrame<StreamEvent>(`id: 7\ndata: ${JSON.stringify(event)}`)]

describe('harness stream events', () => {
  it('parses tool, approval, choice, file, todo, and done frames as typed events', () => {
    const events: StreamEvent[] = [
      { type: 'tool', name: 'draft_posting', state: 'ok', summary: '공고 초안을 저장해요', tier: 'SAFE_WRITE', result: { draft: { id: 'p1' } }, seq: 1 },
      {
        type: 'approval', id: 'a1', kind: 'TOOL_ACTION', title: '지원자 단계를 바꿔요', summary: '지원자 단계를 바꿔요',
        toolName: 'change_applicant_stage', args: { stage: 'INTERVIEW' },
        options: [{ id: 'approve', label: '실행' }, { id: 'reject', label: '취소' }], seq: 2,
      },
      {
        type: 'choice', id: 'c1', kind: 'RESUME_GATE', gate: 'mode_select', recommended: 'resume_based', auto: true,
        options: [{ id: 'resume_based', label: '이력서부터 쓸게요' }, { id: 'cancel', label: '그만하기' }], seq: 3,
      },
      { type: 'file', name: '05_final_resume.md', mime: 'text/markdown', fileId: 'f1', documentId: 'd1', downloadUrl: '/conversations/c/artifacts/05_final_resume.md', seq: 4 },
      { type: 'todo', items: [{ id: 't1', text: '분석', state: 'now' }], seq: 5 },
      { type: 'done', operation: null, awaiting: 'approval', seq: 6 },
    ]
    for (const event of events) expect(frame(event)).toEqual([event])
  })
})

describe('harness endpoints', () => {
  it('resolves an approval with the option id and returns the resume job', async () => {
    const { api, hits } = harness(() => json(202, { data: { id: 'a1', status: 'APPROVED', optionId: 'approve', jobId: 'j1' } }))
    await expect(api.conversations.resolveApproval('c1', 'a1', 'approve')).resolves.toMatchObject({ jobId: 'j1' })
    expect(hits[0]).toMatchObject({ method: 'POST', url: 'http://x/api/v1/conversations/c1/approvals/a1', body: '{"optionId":"approve"}' })
  })

  it('sends the access mode and intent on the stream request', async () => {
    const { api, hits } = harness(() => new Response('data: {"type":"done","operation":null,"seq":1}\n\n', { status: 200 }))
    const out: StreamEvent[] = []
    for await (const event of api.conversations.stream('c1', { text: '안녕', accessMode: 'BYPASS', intent: 'posting' })) out.push(event)
    expect(JSON.parse(hits[0]!.body)).toEqual({ text: '안녕', accessMode: 'BYPASS', intent: 'posting' })
    expect(out).toEqual([{ type: 'done', operation: null, seq: 1 }])
  })

  it('rejects the stream with the server error before any frame is read', async () => {
    const { api } = harness(() => json(403, { error: { code: 'BUSINESS_NOT_VERIFIED', message: 'company is not verified' } }))
    const run = async () => {
      for await (const _ of api.conversations.stream('c1', { text: 'x', accessMode: 'AUTO' })) void _
    }
    await expect(run()).rejects.toMatchObject({ code: 'BUSINESS_NOT_VERIFIED', status: 403 })
  })

  it('follows the active job from the last seq until a terminal event or 204', async () => {
    const replies = [
      new Response('retry: 400\n\n', { status: 200 }),
      new Response('data: {"type":"token","text":"안","seq":4}\n\n', { status: 200 }),
      new Response('data: {"type":"token","text":"녕","seq":5}\n\ndata: {"type":"done","operation":null,"seq":6}\n\n', { status: 200 }),
    ]
    const { api, hits } = harness(() => replies.shift() ?? new Response(null, { status: 204 }))
    const out: StreamEvent[] = []
    for await (const event of api.conversations.follow('c1', 3)) out.push(event)
    expect(out.map((event) => event.seq)).toEqual([4, 5, 6])
    expect(hits.map((hit) => new URL(hit.url).search)).toEqual(['?after=3', '?after=3', '?after=4'])
    const idle = harness(() => new Response(null, { status: 204 }))
    for await (const _ of idle.api.conversations.follow('c1')) void _
    expect(idle.hits).toHaveLength(1)
  })

  it('stores the access mode in settings', async () => {
    const { api, hits } = harness(() => json(200, { data: { aiAccessMode: 'ALWAYS_ASK' } }))
    await expect(api.me.updateSettings({ aiAccessMode: 'ALWAYS_ASK' })).resolves.toMatchObject({ aiAccessMode: 'ALWAYS_ASK' })
    expect(hits[0]).toMatchObject({ method: 'PATCH', url: 'http://x/api/v1/me/settings', body: '{"aiAccessMode":"ALWAYS_ASK"}' })
  })
})

describe('queue jobs', () => {
  const job: QueueJob = {
    id: 'j1', type: 'fit', status: 'RUNNING', progress: null, result: null, error: null,
    createdAt: '2026-10-22T00:00:00Z', updatedAt: '2026-10-22T00:00:01Z',
  }

  it('starts fit and document generation as jobs and reads job status', async () => {
    const { api, hits } = harness((req) =>
      req.method === 'GET' ? json(200, { data: job }) : json(202, { data: { jobId: 'j1' } }),
    )
    await expect(api.postings.fit('p1', 'd1')).resolves.toEqual({ jobId: 'j1' })
    await expect(api.documents.generate('d1', { expectedRevision: 3 })).resolves.toEqual({ jobId: 'j1' })
    await expect(api.jobs.get('j1')).resolves.toEqual(job)
    expect(hits.map((hit) => `${hit.method} ${hit.url} ${hit.body}`)).toEqual([
      'POST http://x/api/v1/postings/p1/fit {"documentId":"d1"}',
      'POST http://x/api/v1/documents/d1/generate {"expectedRevision":3}',
      'GET http://x/api/v1/ai/jobs/j1 ',
    ])
  })

  it('throws QueueBusyError with the retry delay on 429 QUEUE_BUSY', async () => {
    const { api } = harness(() =>
      json(429, { error: { code: 'QUEUE_BUSY', message: 'queue is busy', details: { retryAfterSec: 12 } } }, { 'Retry-After': '12' }),
    )
    const error = await api.postings.fit('p1', 'd1').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(QueueBusyError)
    expect(error).toMatchObject({ code: 'QUEUE_BUSY', status: 429, retryAfterSec: 12 })
  })

  it('polls until the job settles', async () => {
    const get = vi.fn(async () => job)
    const query = jobQuery({ get }, 'j1')
    expect(query.queryKey).toEqual(['ai-job', 'j1'])
    await expect(query.queryFn()).resolves.toBe(job)
    expect(query.refetchInterval({ state: { data: job } })).toBeGreaterThan(0)
    expect(query.refetchInterval({ state: { data: { ...job, status: 'DONE' } } })).toBe(false)
    expect(jobQuery({ get }, null).enabled).toBe(false)
    expect(['QUEUED', 'RUNNING', 'RETRY'].map((status) => isJobSettled({ ...job, status } as QueueJob))).toEqual([false, false, false])
    expect(['DONE', 'FAILED', 'DEAD', 'CANCELLED'].map((status) => isJobSettled({ ...job, status } as QueueJob))).toEqual([true, true, true, true])
  })
})
