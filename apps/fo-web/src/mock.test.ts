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

describe('employer comment author', () => {
  it('labels an employer comment with the company and a personal comment with the member', async () => {
    setMockPersona('employer')
    const employerComment = await read<{ data: { author: { displayName: string; employer?: boolean; companyName?: string | null } } }>(
      await postJson('http://localhost/api/v1/posts/post-emp/comments', { body: '합류를 기다려요' }),
    )
    expect(employerComment.data.author).toMatchObject({ displayName: '모아페이', employer: true, companyName: '모아페이' })

    setMockPersona('personal')
    const personalComment = await read<{ data: { author: { displayName: string; employer?: boolean } } }>(
      await postJson('http://localhost/api/v1/posts/post-1/comments', { body: '응원해요' }),
    )
    expect(personalComment.data.author).toMatchObject({ displayName: '김서준' })
    expect(personalComment.data.author.employer).toBeUndefined()
  })
})

describe('posting revision', () => {
  it('rejects a stale expected revision on patch and close', async () => {
    setMockPersona('employer')
    const created = await read<{ data: { id: string; revision: number } }>(
      await postJson('http://localhost/api/v1/postings', {
        title: '개정 공고',
        jobCategory: 'hr',
        careerMin: 1,
        location: '서울',
        employmentType: 'full_time',
        description: '일',
      }),
    )
    const id = created.data.id
    expect(created.data.revision).toBe(1)
    const stale = await mockFetch(`http://localhost/api/v1/postings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '먼저', expectedRevision: 0 }),
    })
    expect(stale.status).toBe(409)
    expect(((await stale.json()) as { error: { code: string; details: { currentRevision: number } } }).error).toMatchObject({
      code: 'REVISION_CONFLICT',
      details: { currentRevision: 1 },
    })
    const saved = await mockFetch(`http://localhost/api/v1/postings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '다음', expectedRevision: 1 }),
    })
    expect(saved.status).toBe(200)
    expect(((await saved.json()) as { data: { revision: number; title: string } }).data).toMatchObject({ revision: 2, title: '다음' })
    const closedStale = await mockFetch(`http://localhost/api/v1/postings/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision: 1 }),
    })
    expect(closedStale.status).toBe(409)
    const closed = await mockFetch(`http://localhost/api/v1/postings/${id}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedRevision: 2 }),
    })
    expect(closed.status).toBe(200)
    expect(((await closed.json()) as { data: { revision: number; closedAt: string | null } }).data.revision).toBe(3)
  })
})

describe('posting list filters', () => {
  it('keeps dev and design postings when those job categories are selected', async () => {
    setMockPersona('personal')
    const dev = (await (await mockFetch('http://localhost/api/v1/postings?category=dev&sort=latest&limit=4')).json()) as {
      data: { company: string; jobCategory: string }[]
      page: { total: number }
    }
    const design = (await (await mockFetch('http://localhost/api/v1/postings?category=design&sort=latest&limit=4')).json()) as {
      data: { company: string; jobCategory: string }[]
      page: { total: number }
    }
    const both = (await (await mockFetch('http://localhost/api/v1/postings?category=dev,design&sort=latest&limit=4')).json()) as {
      data: { jobCategory: string }[]
      page: { total: number }
    }
    expect(dev.page.total).toBeGreaterThan(0)
    expect(dev.data.every((item) => item.jobCategory === 'dev')).toBe(true)
    expect(dev.data.some((item) => item.company === '누리클라우드')).toBe(true)
    expect(design.page.total).toBeGreaterThan(0)
    expect(design.data.every((item) => item.jobCategory === 'design')).toBe(true)
    expect(design.data.some((item) => item.company === '하루랩스')).toBe(true)
    expect(both.page.total).toBe(dev.page.total + design.page.total)
    expect(new Set(both.data.map((item) => item.jobCategory))).toEqual(new Set(['dev', 'design']))
  })
})

describe('posting detail mock', () => {
  it('returns the listing whose id was requested', async () => {
    setMockPersona('personal')
    const response = await mockFetch('http://localhost/api/v1/postings/p2')
    expect(response.status).toBe(200)
    const body = (await response.json()) as { data: { id: string; company: string; title: string; jobCategory: string } }
    expect(body.data).toMatchObject({
      id: 'p2',
      company: '누리클라우드',
      title: '프론트엔드 개발자',
      jobCategory: 'dev',
    })
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

  it('starts a new empty posting conversation without an attachment', async () => {
    setMockPersona('employer')
    const first = await read<{ data: { id: string; title: string; applicationId: string | null } }>(
      await postJson('http://localhost/api/v1/conversations', { title: '새 공고', audience: 'EMPLOYER' }),
    )
    const second = await read<{ data: { id: string; title: string; applicationId: string | null } }>(
      await postJson('http://localhost/api/v1/conversations', { title: '새 공고', audience: 'EMPLOYER' }),
    )
    expect(first.data.title).toBe('새 공고')
    expect(first.data.applicationId).toBeNull()
    expect(second.data.id).not.toBe(first.data.id)
    const messages = await read<{ data: unknown[] }>(
      await mockFetch(`http://localhost/api/v1/conversations/${first.data.id}/messages`),
    )
    expect(messages.data).toEqual([])
    const listed = await read<{ data: { id: string; title: string }[] }>(
      await mockFetch('http://localhost/api/v1/conversations?audience=EMPLOYER'),
    )
    expect(listed.data.filter((item) => item.title === '새 공고').map((item) => item.id)).toEqual(
      expect.arrayContaining([first.data.id, second.data.id]),
    )
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

describe('employer billing mock', () => {
  const billing = () => mockFetch('http://localhost/api/v1/billing')

  it('returns each persona company plan without putting Basic on a personal account', async () => {
    setMockPersona('employer')
    const basic = await read<{ data: { plan: string; audience: string; balanceMicroCredits: number; subscriptionStatus: string; periodEndsAt: null; reservedMicroCredits: number } }>(
      await billing(),
    )
    expect(basic.data).toEqual({
      plan: 'BASIC',
      audience: 'EMPLOYER',
      balanceMicroCredits: 3000000,
      subscriptionStatus: 'active',
      periodEndsAt: null,
      reservedMicroCredits: 0,
    })

    setMockPersona('employer-pro')
    const pro = await read<{ data: { plan: string; balanceMicroCredits: number; audience: string } }>(await billing())
    expect(pro.data.plan).toBe('PRO')
    expect(pro.data.audience).toBe('EMPLOYER')
    expect(pro.data.balanceMicroCredits).toBe(15000000)

    setMockPersona('employer-ultra')
    const ultra = await read<{ data: { plan: string; balanceMicroCredits: number } }>(await billing())
    expect(ultra.data.plan).toBe('ULTRA')
    expect(ultra.data.balanceMicroCredits).toBe(30000000)

    setMockPersona('employer-new')
    const fresh = await read<{ data: { plan: null; audience: string; balanceMicroCredits: number } }>(await billing())
    expect(fresh.data).toMatchObject({ plan: null, audience: 'EMPLOYER', balanceMicroCredits: 0 })

    setMockPersona('personal')
    const personal = await read<{ data: { plan: string | null; audience: string; balanceMicroCredits: number } }>(await billing())
    expect(personal.data.plan).toBeNull()
    expect(personal.data.plan).not.toBe('BASIC')
    expect(personal.data.audience).toBe('PERSONAL')
    expect(personal.data.balanceMicroCredits).toBe(0)
  })

  it('opens checkout and top-up for an admin and refuses a member', async () => {
    setMockPersona('employer')
    const checkout = await read<{ data: { url: string } }>(
      await postJson('http://localhost/api/v1/billing/checkout', { planId: 'PRO' }),
    )
    const checkoutUrl = new URL(checkout.data.url, 'http://localhost:5175/employer/plans?mock=1')
    expect(checkoutUrl.origin).toBe('http://localhost:5175')
    expect(checkoutUrl.pathname).toBe('/employer/plans')
    expect(checkoutUrl.searchParams.get('checkout')).toBe('PRO')
    const afterCheckout = await read<{ data: { plan: string } }>(await billing())
    expect(afterCheckout.data.plan).toBe('PRO')
    const topup = await read<{ data: { url: string } }>(await postJson('http://localhost/api/v1/billing/topup', { amount: 3000 }))
    const topupUrl = new URL(topup.data.url, 'http://localhost:5175/employer/plans?mock=1')
    expect(topupUrl.origin).toBe('http://localhost:5175')
    expect(topupUrl.pathname).toBe('/employer/plans')
    expect(topupUrl.searchParams.get('topup')).toBe('3000')
    const afterTopup = await read<{ data: { balanceMicroCredits: number; plan: string } }>(await billing())
    expect(afterTopup.data.balanceMicroCredits).toBeGreaterThan(3000000)
    expect(afterTopup.data.plan).toBe('PRO')
    await postJson('http://localhost/api/v1/billing/checkout', { planId: 'BASIC' })

    setMockPersona('employer-pro')
    const transferred = await mockFetch('http://localhost/api/v1/companies/me/members/u-member', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    })
    expect(transferred.status).toBe(204)
    const forbidden = await read<{ error: { code: string } }>(
      await postJson('http://localhost/api/v1/billing/checkout', { planId: 'ULTRA' }),
    )
    expect(forbidden.error.code).toBe('FORBIDDEN')
    const forbiddenTopup = await mockFetch('http://localhost/api/v1/billing/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 10 }),
    })
    expect(forbiddenTopup.status).toBe(403)
    await mockFetch('http://localhost/api/v1/companies/me/members/u1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    })

    setMockPersona('personal')
    const personalCheckout = await mockFetch('http://localhost/api/v1/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'BASIC' }),
    })
    expect(personalCheckout.status).toBe(403)

    setMockPersona('employer-new')
    const firstPlan = await read<{ data: { url: string } }>(
      await postJson('http://localhost/api/v1/billing/checkout', { planId: 'BASIC' }),
    )
    const firstUrl = new URL(firstPlan.data.url, 'http://localhost:5175/employer/plans?mock=1')
    expect(firstUrl.origin).toBe('http://localhost:5175')
    expect(firstUrl.pathname).toBe('/employer/plans')
    expect(firstUrl.searchParams.get('checkout')).toBe('BASIC')
  })

  it('returns an empty ledger', async () => {
    setMockPersona('employer')
    const ledger = await read<{ data: unknown[]; page: { nextCursor: null; total: number } }>(
      await mockFetch('http://localhost/api/v1/billing/ledger'),
    )
    expect(ledger.data).toEqual([])
    expect(ledger.page).toMatchObject({ nextCursor: null, total: 0 })
  })
})

const api = (path: string) => `http://localhost/api/v1${path}`

const get = (path: string) => mockFetch(api(path))

const send = (method: string, path: string, body?: unknown) => {
  if (body === undefined) return mockFetch(api(path), { method })
  return mockFetch(api(path), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('mock route coverage', () => {
  it.each([
    {
      name: 'accepts personal email signup',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/email/signup'), {
          email: 'new@push.app',
          password: 'password12',
          accountType: 'PERSONAL',
          displayName: '김서준',
        })
        expect(response.status).toBe(202)
      },
    },
    {
      name: 'logs in with an access token',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/email/login'), { email: 'kim@push.app', password: 'password12' })
        expect(response.status).toBe(200)
        const body = await read<{ data: { accessToken: string } }>(response)
        expect(typeof body.data.accessToken).toBe('string')
        expect(body.data.accessToken.length).toBeGreaterThan(0)
      },
    },
    {
      name: 'verifies an email token into a session',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/email/verify'), { token: 'ok' })
        expect(response.status).toBe(200)
        const body = await read<{ data: { accessToken: string } }>(response)
        expect(typeof body.data.accessToken).toBe('string')
      },
    },
    {
      name: 'accepts a password reset request',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/email/password-reset'), { email: 'kim@push.app' })
        expect(response.status).toBe(202)
      },
    },
    {
      name: 'confirms a password reset',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/email/password-reset/confirm'), { token: 'ok', password: 'password12' })
        expect(response.status).toBe(204)
      },
    },
    {
      name: 'exchanges an oauth code',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/auth/exchange'), { code: 'ok', codeVerifier: 'v' })
        expect(response.status).toBe(200)
        const body = await read<{ data: { accessToken: string } }>(response)
        expect(typeof body.data.accessToken).toBe('string')
      },
    },
    {
      name: 'returns the current user',
      persona: 'personal',
      act: async () => {
        const response = await get('/auth/me')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string } }>(response)
        expect(typeof body.data.id).toBe('string')
      },
    },
    {
      name: 'lists latest postings',
      persona: 'personal',
      act: async () => {
        const response = await get('/postings?sort=latest')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[]; page: { total: number } }>(response)
        expect(typeof body.page.total).toBe('number')
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'lists posting locations',
      persona: 'personal',
      act: async () => {
        const response = await get('/postings/locations')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'returns a posting',
      persona: 'personal',
      act: async () => {
        const response = await get('/postings/p1')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string } }>(response)
        expect(body.data.id).toBe('p1')
      },
    },
    {
      name: 'bookmarks a posting',
      persona: 'personal',
      act: async () => {
        const response = await send('POST', '/postings/p1/bookmark')
        expect(response.status).toBe(204)
      },
    },
    {
      name: 'applies to a posting',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/postings/p1/apply'), { documentIds: ['src-1'] })
        expect(response.status).toBe(200)
        const body = await read<{ data: { stage: string } }>(response)
        expect(body.data.stage).toBe('APPLIED')
      },
    },
    {
      name: 'searches postings',
      persona: 'personal',
      act: async () => {
        const response = await get(`/search?q=${encodeURIComponent('모아페이')}&type=postings`)
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'lists profiles',
      persona: 'personal',
      act: async () => {
        const response = await get('/profiles')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'returns a profile',
      persona: 'personal',
      act: async () => {
        const response = await get('/profiles/u2')
        expect(response.status).toBe(200)
        const body = await read<{ data: { userId: string } }>(response)
        expect(body.data.userId).toBe('u2')
      },
    },
    {
      name: 'sends a profile offer',
      persona: 'personal',
      act: async () => {
        const response = await postJson(api('/profiles/u2/offer'), { message: '안녕하세요' })
        expect(response.status).toBe(200)
        const body = await read<{ data: { message: string } }>(response)
        expect(body.data.message).toBe('안녕하세요')
      },
    },
    {
      name: 'follows a user',
      persona: 'personal',
      act: async () => {
        const response = await send('POST', '/users/u2/follow')
        expect(response.status).toBe(204)
      },
    },
    {
      name: 'lists posts',
      persona: 'personal',
      act: async () => {
        const response = await get('/posts')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string }[] }>(response)
        expect(body.data.some((item) => item.id === 'post-1')).toBe(true)
      },
    },
    {
      name: 'returns the seeded personal post',
      persona: 'personal',
      act: async () => {
        const response = await get('/posts/post-1')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string } }>(response)
        expect(body.data.id).toBe('post-1')
      },
    },
    {
      name: 'returns the seeded employer post',
      persona: 'personal',
      act: async () => {
        const response = await get('/posts/post-emp')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string } }>(response)
        expect(body.data.id).toBe('post-emp')
      },
    },
    {
      name: 'returns a post created in this session',
      persona: 'personal',
      act: async () => {
        const created = await read<{ data: { id: string } }>(
          await postJson(api('/posts'), { category: 'career', title: '새 글', body: '본문', imageKeys: [] }),
        )
        const response = await get(`/posts/${created.data.id}`)
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string; title: string } }>(response)
        expect(body.data.id).toBe(created.data.id)
        expect(body.data.title).toBe('새 글')
      },
    },
    {
      name: 'returns not found for a missing post',
      persona: 'personal',
      act: async () => {
        const response = await get('/posts/missing-post')
        expect(response.status).toBe(404)
        const body = await read<{ error: { code: string; message: string } }>(response)
        expect(body.error.code).toBe('NOT_FOUND')
        expect(body.error.message.length).toBeGreaterThan(0)
      },
    },
    {
      name: 'lists comments on a post',
      persona: 'personal',
      act: async () => {
        const response = await get('/posts/post-1/comments')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(Array.isArray(body.data)).toBe(true)
      },
    },
    {
      name: 'returns my profile and resume source',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/profile')
        expect(response.status).toBe(200)
        const body = await read<{ data: { resumeSourceId: string } }>(response)
        expect(body.data.resumeSourceId).toBe('src-resume')
      },
    },
    {
      name: 'lists bookmarks',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/bookmarks')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(Array.isArray(body.data)).toBe(true)
      },
    },
    {
      name: 'lists follows',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/follows')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(Array.isArray(body.data)).toBe(true)
      },
    },
    {
      name: 'lists an application stage notification',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/notifications')
        expect(response.status).toBe(200)
        const body = await read<{ data: { type: string }[] }>(response)
        expect(body.data.some((item) => item.type === 'APPLICATION_STAGE')).toBe(true)
      },
    },
    {
      name: 'returns settings',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/settings')
        expect(response.status).toBe(200)
        const body = await read<{ data: { locale: string } }>(response)
        expect(body.data.locale).toBe('ko')
      },
    },
    {
      name: 'lists received offers',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/offers?box=received')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'returns consents',
      persona: 'personal',
      act: async () => {
        const response = await get('/me/consents')
        expect(response.status).toBe(200)
        const body = await read<{ data: { referenceData: boolean } }>(response)
        expect(typeof body.data.referenceData).toBe('boolean')
      },
    },
    {
      name: 'returns a source that the list already includes',
      persona: 'personal',
      act: async () => {
        const listed = await read<{ data: { id: string }[] }>(await get('/sources'))
        expect(Array.isArray(listed.data)).toBe(true)
        expect(listed.data.some((item) => item.id === 'src-resume')).toBe(true)
        const response = await get('/sources/src-resume')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string } }>(response)
        expect(body.data.id).toBe('src-resume')
      },
    },
    {
      name: 'returns not found for a missing source',
      persona: 'personal',
      act: async () => {
        const response = await get('/sources/missing-source')
        expect(response.status).toBe(404)
        const body = await read<{ error: { code: string } }>(response)
        expect(body.error.code).toBe('NOT_FOUND')
      },
    },
    {
      name: 'lists an application with a fit score',
      persona: 'personal',
      act: async () => {
        const response = await get('/applications')
        expect(response.status).toBe(200)
        const body = await read<{ data: { fitScore?: number }[] }>(response)
        expect(body.data.some((item) => item.fitScore === 6.9)).toBe(true)
      },
    },
    {
      name: 'lists calendar events in range',
      persona: 'personal',
      act: async () => {
        const response = await get('/calendar/events?from=2026-10-01&to=2026-10-31')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'accepts an image upload',
      persona: 'personal',
      act: async () => {
        const form = new FormData()
        form.append('file', new Blob(['png'], { type: 'image/png' }), 'photo.png')
        const response = await mockFetch(api('/uploads/images'), { method: 'POST', body: form })
        expect(response.status).toBe(200)
        const body = await read<{ data: { key: string } }>(response)
        expect(typeof body.data.key).toBe('string')
      },
    },
    {
      name: 'returns not found for an unknown route',
      persona: 'personal',
      act: async () => {
        const response = await get('/no-such-route')
        expect(response.status).toBe(404)
        const body = await read<{ error: { code: string; message: string } }>(response)
        expect(body.error.code).toBe('NOT_FOUND')
        expect(body.error.message.length).toBeGreaterThan(0)
      },
    },
    {
      name: 'returns the basic company',
      persona: 'employer',
      act: async () => {
        const response = await get('/companies/me')
        expect(response.status).toBe(200)
        const body = await read<{ data: { plan: string } }>(response)
        expect(body.data.plan).toBe('BASIC')
      },
    },
    {
      name: 'lists company members',
      persona: 'employer',
      act: async () => {
        const response = await get('/companies/me/members')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(body.data.length).toBeGreaterThanOrEqual(1)
      },
    },
    {
      name: 'lists company postings',
      persona: 'employer',
      act: async () => {
        const response = await get('/companies/me/postings')
        expect(response.status).toBe(200)
        const body = await read<{ data: { id: string }[] }>(response)
        expect(body.data.some((item) => item.id === 'job-1')).toBe(true)
      },
    },
    {
      name: 'lists applicants',
      persona: 'employer',
      act: async () => {
        const response = await get('/postings/job-1/applicants')
        expect(response.status).toBe(200)
        const body = await read<{ data: { applicationId: string }[] }>(response)
        expect(body.data.some((item) => item.applicationId === 'app-2')).toBe(true)
      },
    },
    {
      name: 'returns the screening applicant',
      persona: 'employer',
      act: async () => {
        const response = await get('/postings/job-1/applicants/app-2')
        expect(response.status).toBe(200)
        const body = await read<{ data: { application: { id: string; stage: string } } }>(response)
        expect(body.data.application.id).toBe('app-2')
        expect(body.data.application.stage).toBe('SCREENING')
      },
    },
    {
      name: 'opens billing checkout',
      persona: 'employer',
      act: async () => {
        const response = await postJson(api('/billing/checkout'), { planId: 'PRO' })
        expect(response.status).toBe(200)
        const body = await read<{ data: { url: string } }>(response)
        expect(typeof body.data.url).toBe('string')
        expect(body.data.url.length).toBeGreaterThan(0)
        const restored = await postJson(api('/billing/checkout'), { planId: 'BASIC' })
        expect(restored.status).toBe(200)
      },
    },
    {
      name: 'returns a credit balance',
      persona: 'employer',
      act: async () => {
        const response = await get('/billing')
        expect(response.status).toBe(200)
        const body = await read<{ data: { balanceMicroCredits: number } }>(response)
        expect(typeof body.data.balanceMicroCredits).toBe('number')
      },
    },
    {
      name: 'lists employer conversations',
      persona: 'employer',
      act: async () => {
        const response = await get('/conversations?audience=EMPLOYER')
        expect(response.status).toBe(200)
        const body = await read<{ data: unknown[] }>(response)
        expect(Array.isArray(body.data)).toBe(true)
      },
    },
    {
      name: 'verifies a new company',
      persona: 'employer-new',
      act: async () => {
        const response = await postJson(api('/companies/verify'), {
          bNo: '1234567890',
          startDt: '20200101',
          pNm: '김대표',
          bNm: '새회사',
        })
        expect(response.status).toBe(201)
        const body = await read<{ data: { name: string } }>(response)
        expect(body.data.name).toBe('새회사')
      },
    },
  ])('$name', async ({ persona, act }) => {
    setMockPersona(persona)
    await act()
  })

  it('answers the other screen calls', async () => {
    setMockPersona('personal')
    const personal: ReadonlyArray<readonly [string, string, unknown?]> = [
      ['DELETE', '/postings/p1/bookmark', undefined],
      ['PATCH', '/me/profile', { displayName: '김서준', headline: '백엔드', intro: '소개', careers: [], skills: ['Kotlin'] }],
      ['PATCH', '/me/settings', { notifyApplicationStage: true }],
      ['PUT', '/me/consents', { referenceData: true }],
      ['POST', '/me/notifications/read', { all: true }],
      ['GET', '/me/offers?box=sent', undefined],
      ['GET', '/me/offers/offer-1', undefined],
      ['GET', '/me/offers/offer-1/messages', undefined],
      ['POST', '/me/offers/offer-1/messages', { body: '답장해요' }],
      ['POST', '/me/offers/offer-1/accept', { reply: '수락해요' }],
      ['POST', '/me/offers/offer-2/decline', undefined],
      ['DELETE', '/users/u2/follow', undefined],
      ['POST', '/posts/post-1/comments', { body: '응원해요' }],
      ['GET', '/me/posts', undefined],
      ['DELETE', '/me', undefined],
    ]
    const personalStatus: Record<string, number> = {
      'DELETE /postings/p1/bookmark': 204,
      'PATCH /me/profile': 200,
      'PATCH /me/settings': 200,
      'PUT /me/consents': 200,
      'POST /me/notifications/read': 204,
      'GET /me/offers?box=sent': 200,
      'GET /me/offers/offer-1': 200,
      'GET /me/offers/offer-1/messages': 200,
      'POST /me/offers/offer-1/messages': 200,
      'POST /me/offers/offer-1/accept': 200,
      'POST /me/offers/offer-2/decline': 200,
      'DELETE /users/u2/follow': 204,
      'POST /posts/post-1/comments': 200,
      'GET /me/posts': 200,
      'DELETE /me': 204,
    }
    for (const [method, path, body] of personal) {
      const response = await send(method, path, body)
      expect(response.status, `${method} ${path}`).toBe(personalStatus[`${method} ${path}`])
    }
    const resume = new FormData()
    resume.set('file', new Blob(['%PDF'], { type: 'application/pdf' }), 'resume.pdf')
    resume.set('kind', 'resume')
    const uploaded = await mockFetch(api('/sources'), { method: 'POST', body: resume })
    expect(uploaded.status).toBe(200)
    const uploadedBody = await read<{ data: { id: string } }>(uploaded)
    const uploadedDetail = await get(`/sources/${uploadedBody.data.id}`)
    expect(uploadedDetail.status).toBe(200)

    setMockPersona('employer')
    const postingResponse = await send('POST', '/postings', {
      title: '신규 공고',
      jobCategory: 'dev',
      careerMin: 3,
      location: '서울',
      employmentType: 'full_time',
      description: '일',
      requirements: ['경력'],
      preferred: [],
      workConditions: {},
    })
    expect(postingResponse.status).toBe(201)
    const created = await read<{ data: { id: string } }>(postingResponse)
    expect(created.data.id.length).toBeGreaterThan(0)
    const employer: ReadonlyArray<readonly [string, string, number, unknown?]> = [
      ['PATCH', '/postings/job-1', 200, { title: '시니어 백엔드', expectedRevision: 1 }],
      ['POST', '/postings/job-1/close', 200, { expectedRevision: 2 }],
      ['POST', '/companies/me/invites', 403, { email: 'seat@push.app' }],
      ['POST', '/companies/invites/invite-token/accept', 204, undefined],
      ['POST', '/billing/topup', 200, { amount: 3000 }],
      ['GET', '/billing/ledger', 200, undefined],
      ['POST', '/conversations', 201, { title: '서류 검토', audience: 'EMPLOYER' }],
    ]
    for (const [method, path, status, body] of employer) {
      const response = await send(method, path, body)
      expect(response.status, `${method} ${path}`).toBe(status)
    }

    setMockPersona('employer-pro')
    const invited = await send('POST', '/companies/me/invites', { email: 'seat@push.app' })
    expect(invited.status).toBe(201)
    const members = await read<{ data: { userId: string; email: string }[] }>(await get('/companies/me/members'))
    const added = members.data.find((member) => member.email === 'seat@push.app')
    expect(added?.userId).toBeTruthy()
    const removed = await send('DELETE', `/companies/me/members/${added?.userId}`)
    expect(removed.status).toBe(204)
  }, 20_000)
})
