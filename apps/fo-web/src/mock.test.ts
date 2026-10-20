import { describe, expect, it } from 'vitest'
import { GENERAL_REPLY, REVIEW_REPLY, parsePostingDraft } from './shared/model/employer-chat'
import { mockFetch, setMockPersona } from './mock'

const read = async <T>(response: Response) => (await response.json()) as T

const postJson = (url: string, body: unknown) =>
  mockFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('employer applicant stage mock', () => {
  it('moves an open application to screening and refuses a change after rejection', async () => {
    setMockPersona('employer')
    const moved = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'SCREENING' }),
    })
    expect(moved.status).toBe(200)
    expect(((await moved.json()) as { data: { stage: string } }).data.stage).toBe('SCREENING')

    const rejected = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'REJECTED' }),
    })
    expect(rejected.status).toBe(200)

    const blocked = await mockFetch('http://localhost/api/v1/postings/job-1/applicants/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'INTERVIEW' }),
    })
    expect(blocked.status).toBe(409)
    expect(((await blocked.json()) as { error: { code: string } }).error.code).toBe('INVALID_TRANSITION')
  })
})

describe('employer chat mock', () => {
  it('gives employer-ultra an Ultra company and leaves the other personas in place', async () => {
    setMockPersona('employer-ultra')
    const ultra = await read<{ data: { plan: string; role: string; name: string; seats: { used: number; limit: number } } }>(
      await mockFetch('http://localhost/api/v1/companies/me'),
    )
    expect(ultra.data).toMatchObject({ plan: 'ULTRA', role: 'ADMIN', name: '모아페이', seats: { used: 0, limit: 5 } })

    setMockPersona('employer')
    const basic = await read<{ data: { plan: string; seats: { limit: number } } }>(await mockFetch('http://localhost/api/v1/companies/me'))
    expect(basic.data.plan).toBe('BASIC')
    expect(basic.data.seats.limit).toBe(0)

    setMockPersona('employer-pro')
    const pro = await read<{ data: { plan: string; seats: { limit: number } } }>(await mockFetch('http://localhost/api/v1/companies/me'))
    expect(pro.data.plan).toBe('PRO')
    expect(pro.data.seats.limit).toBe(2)

    setMockPersona('employer-new')
    const missing = await mockFetch('http://localhost/api/v1/companies/me')
    expect(missing.status).toBe(404)
  })

  it('stores an employer conversation and lists it when audience is missing', async () => {
    setMockPersona('employer-pro')
    const created = await read<{ data: { id: string; revision: number; applicationId: string | null; title: string; pinned: boolean } }>(
      await postJson('http://localhost/api/v1/conversations', {
        title: '참고 공고',
        audience: 'EMPLOYER',
        postingId: 'job-1',
        applicationId: 'app-1',
      }),
    )
    expect(created.data).toMatchObject({ revision: 1, applicationId: 'app-1', title: '참고 공고', pinned: false })

    const open = await read<{ data: { id: string }[] }>(await mockFetch('http://localhost/api/v1/conversations'))
    const filtered = await read<{ data: { id: string }[] }>(
      await mockFetch('http://localhost/api/v1/conversations?audience=EMPLOYER'),
    )
    expect(open.data.some((item) => item.id === created.data.id)).toBe(true)
    expect(filtered.data.some((item) => item.id === created.data.id)).toBe(true)
  })

  it('blocks interview on Basic and answers review, posting, and general prompts', async () => {
    setMockPersona('employer')
    const created = await read<{ data: { id: string } }>(
      await postJson('http://localhost/api/v1/conversations', { title: '서류 검토', audience: 'EMPLOYER' }),
    )
    const blocked = await read<{ error: { code: string; details: { requiredPlan: string } } }>(
      await postJson(`http://localhost/api/v1/conversations/${created.data.id}/messages`, {
        text: '질문 만들어 주세요',
        accessMode: 'SUGGEST',
        intent: 'interview',
      }),
    )
    expect(blocked.error.code).toBe('PLAN_REQUIRED')
    expect(blocked.error.details.requiredPlan).toBe('PRO')
    const keyword = await mockFetch(`http://localhost/api/v1/conversations/${created.data.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '면접 준비를 도와주세요', accessMode: 'SUGGEST' }),
    })
    expect(keyword.status).toBe(403)
    const empty = await read<{ data: { text: string }[] }>(
      await mockFetch(`http://localhost/api/v1/conversations/${created.data.id}/messages`),
    )
    expect(empty.data).toEqual([])

    setMockPersona('employer-pro')
    const pro = await read<{ data: { id: string } }>(
      await postJson('http://localhost/api/v1/conversations', { title: '새 공고', audience: 'EMPLOYER' }),
    )
    const send = (body: unknown) => postJson(`http://localhost/api/v1/conversations/${pro.data.id}/messages`, body)
    expect((await send({ text: '이 사람 봐요', accessMode: 'SUGGEST', intent: 'review' })).status).toBe(202)
    expect((await send({ text: '공고를 작성해 주세요', accessMode: 'SUGGEST', intent: 'posting' })).status).toBe(202)
    expect((await send({ text: '안녕하세요', accessMode: 'SUGGEST', intent: 'general' })).status).toBe(202)
    const messages = await read<{ data: { role: string; text: string }[] }>(
      await mockFetch(`http://localhost/api/v1/conversations/${pro.data.id}/messages`),
    )
    const assistant = messages.data.filter((item) => item.role === 'ASSISTANT').map((item) => item.text)
    expect(assistant[0]).toBe(REVIEW_REPLY)
    expect(assistant[0]?.includes('합격')).toBe(false)
    expect(parsePostingDraft(assistant[1] ?? '')?.title).toBe('백엔드 엔지니어')
    expect(assistant[2]).toBe(GENERAL_REPLY)
    expect(messages.data.filter((item) => item.role === 'USER')).toHaveLength(3)
  })

  it('requires verification to start a chat and Ultra to attach a PDF', async () => {
    setMockPersona('employer-new')
    const denied = await read<{ error: { code: string } }>(
      await postJson('http://localhost/api/v1/conversations', { title: '새 공고', audience: 'EMPLOYER' }),
    )
    expect(denied.error.code).toBe('BUSINESS_NOT_VERIFIED')

    const form = new FormData()
    form.append('file', new Blob(['pdf'], { type: 'application/pdf' }), 'resume.pdf')
    const attach = (persona: string) => {
      setMockPersona(persona)
      return mockFetch('http://localhost/api/v1/conversations/c1/attachments', { method: 'POST', body: form })
    }
    const basic = await read<{ error: { code: string; details: { requiredPlan: string } } }>(await attach('employer'))
    expect(basic.error).toMatchObject({ code: 'PLAN_REQUIRED', details: { requiredPlan: 'ULTRA' } })
    const pro = await read<{ error: { details: { requiredPlan: string } } }>(await attach('employer-pro'))
    expect(pro.error.details.requiredPlan).toBe('ULTRA')
    const ultra = await read<{ data: { id: string; fileName: string } }>(await attach('employer-ultra'))
    expect(ultra.data.id).toBe('file-1')
    expect(ultra.data.fileName).toBe('resume.pdf')
  })
})
