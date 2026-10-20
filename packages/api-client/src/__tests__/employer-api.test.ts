import { describe, expect, it, vi } from 'vitest'
import { createClient } from '../client'
import { createApi } from '../endpoints'
import type {
  Application, BillingStatus, CompanyBillingStatus, Post, PostingDetail, Session, Settings, WebNotification,
} from '../types'

// conversations.list(page?: PageParams & { audience?: 'EMPLOYER' | 'PERSONAL' }) — not a second argument.

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const noContent = (status: number) => new Response(null, { status })

type Hit = { method: string; url: string; body: string }

const harness = (reply: (req: Request) => Response | Promise<Response> = () => json(200, { data: null })) => {
  const hits: Hit[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    hits.push({ method: req.method, url: req.url, body: await req.clone().text() })
    return reply(req)
  })
  const api = createApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem' }))
  return { api, hits }
}

const bodyOf = (hit: Hit) => JSON.parse(hit.body) as unknown

const company = {
  id: 'co1',
  bNo: '1234567890',
  name: '푸시',
  plan: null,
  verifiedAt: '2026-10-21T00:00:00.000Z',
  role: 'ADMIN' as const,
  seats: { used: 1, limit: 0 },
}

const session = {
  accessToken: 'atk',
  refreshToken: 'rtk',
  expiresIn: 900,
  user: { id: 'u1', displayName: '김서준', locale: 'ko' },
}

describe('employer api', () => {
  it('posts email signup with account type and optional consent', async () => {
    const { api, hits } = harness(() => noContent(202))
    await api.auth.emailSignup({
      email: 'a@push.app',
      password: 'secret123',
      accountType: 'EMPLOYER',
      displayName: '김서준',
      consentReference: true,
    })
    await api.auth.emailSignup({
      email: 'b@push.app',
      password: 'secret123',
      accountType: 'PERSONAL',
      displayName: '이하은',
    })
    expect(hits[0]).toMatchObject({ method: 'POST' })
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/auth/email/signup')
    expect(bodyOf(hits[0]!)).toEqual({
      email: 'a@push.app',
      password: 'secret123',
      accountType: 'EMPLOYER',
      displayName: '김서준',
      consentReference: true,
    })
    expect(bodyOf(hits[1]!)).toEqual({
      email: 'b@push.app',
      password: 'secret123',
      accountType: 'PERSONAL',
      displayName: '이하은',
    })
  })

  it('posts company verify fields and returns the company', async () => {
    const { api, hits } = harness(() => json(201, { data: company }))
    await expect(
      api.companies.verify({ bNo: '1234567890', startDt: '20200101', pNm: '김대표', bNm: '푸시' }),
    ).resolves.toEqual(company)
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/companies/verify')
    expect(bodyOf(hits[0]!)).toEqual({ bNo: '1234567890', startDt: '20200101', pNm: '김대표', bNm: '푸시' })
  })

  it('patches an applicant stage', async () => {
    const { api, hits } = harness(() => json(200, { data: { id: 'a1', stage: 'SCREENING' } }))
    await api.postings.setApplicantStage('p1', 'a1', 'SCREENING')
    expect(hits[0]!.method).toBe('PATCH')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/postings/p1/applicants/a1')
    expect(bodyOf(hits[0]!)).toEqual({ stage: 'SCREENING' })
  })

  it('creates an employer conversation with audience EMPLOYER', async () => {
    const { api, hits } = harness(() => json(201, { data: { id: 'c1', title: '새 공고' } }))
    await api.conversations.createEmployer({ title: '새 공고', postingId: 'p1' })
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/conversations')
    expect(bodyOf(hits[0]!)).toEqual({ title: '새 공고', postingId: 'p1', audience: 'EMPLOYER' })
  })

  it('keeps conversations.create limited to a title', async () => {
    const { api, hits } = harness(() => json(201, { data: { id: 'c1' } }))
    await api.conversations.create('hello')
    expect(bodyOf(hits[0]!)).toEqual({ title: 'hello' })
  })

  it('posts a conversation message and does not require a json envelope', async () => {
    const { api, hits } = harness(() => new Response('accepted', { status: 202, headers: { 'Content-Type': 'text/plain' } }))
    await api.conversations.send('c1', { text: '면접 준비', accessMode: 'SUGGEST', intent: 'interview' })
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname.endsWith('/conversations/c1/messages')).toBe(true)
    expect(bodyOf(hits[0]!)).toMatchObject({ text: '면접 준비', accessMode: 'SUGGEST' })
  })

  it('checks out BASIC by planId', async () => {
    const { api, hits } = harness(() => json(200, { data: { url: 'https://pay.example/basic' } }))
    await expect(api.billing.checkout('BASIC')).resolves.toEqual({ url: 'https://pay.example/basic' })
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/billing/checkout')
    expect(bodyOf(hits[0]!)).toEqual({ planId: 'BASIC' })
  })

  it('puts reference data consent', async () => {
    const { api, hits } = harness(() => json(200, { data: { referenceData: true, updatedAt: '2026-10-21T00:00:00.000Z' } }))
    await expect(api.me.updateConsents(true)).resolves.toEqual({
      referenceData: true,
      updatedAt: '2026-10-21T00:00:00.000Z',
    })
    expect(hits[0]!.method).toBe('PUT')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/me/consents')
    expect(bodyOf(hits[0]!)).toEqual({ referenceData: true })
  })

  it('lists conversations without audience unless the page asks for one', async () => {
    const { api, hits } = harness(() => json(200, { data: [], page: { nextCursor: null, hasMore: false } }))
    await api.conversations.list()
    await api.conversations.list({ limit: 10 })
    await api.conversations.list({ limit: 10, audience: 'EMPLOYER' })
    expect(decodeURIComponent(hits[0]!.url)).toBe('http://x/api/v1/conversations')
    expect(decodeURIComponent(hits[1]!.url)).toBe('http://x/api/v1/conversations?limit=10')
    expect(decodeURIComponent(hits[2]!.url)).toBe('http://x/api/v1/conversations?limit=10&audience=EMPLOYER')
  })

  it('sends accountType on oauth start', async () => {
    const { api, hits } = harness(() => json(200, { data: { authorizationUrl: 'https://auth.example', state: 's' } }))
    await api.auth.start('google', {
      codeChallenge: 'chal',
      redirectUri: 'http://localhost:5174/auth/callback',
      accountType: 'EMPLOYER',
    })
    expect(decodeURIComponent(hits[0]!.url)).toBe(
      'http://x/api/v1/auth/google/start?codeChallenge=chal&redirectUri=http://localhost:5174/auth/callback&accountType=EMPLOYER&codeChallengeMethod=S256',
    )
  })

  it('loads the current account', async () => {
    const me = {
      id: 'u1',
      displayName: '김서준',
      locale: 'ko',
      createdAt: '2026-01-01T00:00:00.000Z',
      accountType: 'EMPLOYER' as const,
      companyId: null,
      companyRole: null,
    }
    const { api, hits } = harness(() => json(200, { data: me }))
    await expect(api.auth.me()).resolves.toEqual(me)
    expect(hits[0]!.method).toBe('GET')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/auth/me')
  })

  it('verifies email and logs in with a session', async () => {
    const { api, hits } = harness(() => json(200, { data: session }))
    await expect(api.auth.emailVerify('tok')).resolves.toEqual(session)
    await expect(api.auth.emailLogin('a@push.app', 'secret123')).resolves.toEqual(session)
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/auth/email/verify')
    expect(bodyOf(hits[0]!)).toEqual({ token: 'tok' })
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/auth/email/login')
    expect(bodyOf(hits[1]!)).toEqual({ email: 'a@push.app', password: 'secret123' })
  })

  it('requests and confirms a password reset', async () => {
    const { api, hits } = harness((req) => noContent(req.url.includes('confirm') ? 204 : 202))
    await api.auth.requestPasswordReset('a@push.app')
    await api.auth.confirmPasswordReset('tok', 'new-secret')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/auth/email/password-reset')
    expect(bodyOf(hits[0]!)).toEqual({ email: 'a@push.app' })
    expect(hits[1]!.method).toBe('POST')
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/auth/email/password-reset/confirm')
    expect(bodyOf(hits[1]!)).toEqual({ token: 'tok', password: 'new-secret' })
  })

  it('tops up, opens the portal, lists the ledger, and verifies iap', async () => {
    const ledger = {
      data: [{ type: 'PURCHASE' as const, amountMicroCredits: 30, balanceAfter: 30, createdAt: '2026-10-21T00:00:00.000Z' }],
      page: { nextCursor: null, hasMore: false },
    }
    const { api, hits } = harness((req) => {
      const path = new URL(req.url).pathname
      if (path.endsWith('/ledger')) return json(200, ledger)
      if (path.endsWith('/iap/verify')) return json(200, { data: { plan: 'BASIC', periodEndsAt: '2026-11-21T00:00:00.000Z' } })
      return json(200, { data: { url: 'https://pay.example/next' } })
    })
    await expect(api.billing.topup(3000)).resolves.toEqual({ url: 'https://pay.example/next' })
    await expect(api.billing.portal()).resolves.toEqual({ url: 'https://pay.example/next' })
    await expect(api.billing.ledger({ limit: 10, cursor: 'c1' })).resolves.toEqual(ledger)
    await expect(
      api.billing.verifyIap({ platform: 'APP_STORE', productId: 'push.basic', signedTransaction: 'jws' }),
    ).resolves.toEqual({ plan: 'BASIC', periodEndsAt: '2026-11-21T00:00:00.000Z' })
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/billing/topup')
    expect(bodyOf(hits[0]!)).toEqual({ amount: 3000 })
    expect(hits[1]!.method).toBe('POST')
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/billing/portal')
    expect(hits[1]!.body).toBe('')
    expect(decodeURIComponent(hits[2]!.url)).toBe('http://x/api/v1/billing/ledger?limit=10&cursor=c1')
    expect(new URL(hits[3]!.url).pathname).toBe('/api/v1/billing/iap/verify')
    expect(bodyOf(hits[3]!)).toEqual({ platform: 'APP_STORE', productId: 'push.basic', signedTransaction: 'jws' })
  })

  it('reads the company and unwraps members', async () => {
    const member = { userId: 'u2', email: 'm@push.app', role: 'MEMBER' as const, joinedAt: '2026-10-01T00:00:00.000Z' }
    const { api, hits } = harness((req) => {
      if (new URL(req.url).pathname.endsWith('/members')) return json(200, { data: [member], page: { nextCursor: null, hasMore: false } })
      return json(200, { data: company })
    })
    await expect(api.companies.me()).resolves.toEqual(company)
    await expect(api.companies.members()).resolves.toEqual([member])
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/companies/me')
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/companies/me/members')
  })

  it('invites, accepts, removes, and transfers a company admin', async () => {
    const { api, hits } = harness((req) => (req.method === 'POST' && !req.url.includes('accept') ? json(201, {}) : noContent(204)))
    await api.companies.invite('m@push.app')
    await api.companies.acceptInvite('tok')
    await api.companies.removeMember('u2')
    await api.companies.transferAdmin('u2')
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/companies/me/invites')
    expect(bodyOf(hits[0]!)).toEqual({ email: 'm@push.app' })
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/companies/invites/tok/accept')
    expect(hits[1]!.method).toBe('POST')
    expect(hits[2]!.method).toBe('DELETE')
    expect(new URL(hits[2]!.url).pathname).toBe('/api/v1/companies/me/members/u2')
    expect(hits[3]!.method).toBe('PATCH')
    expect(new URL(hits[3]!.url).pathname).toBe('/api/v1/companies/me/members/u2')
    expect(bodyOf(hits[3]!)).toEqual({ role: 'ADMIN' })
  })

  it('creates, updates, and closes a posting', async () => {
    const input = {
      title: '백엔드',
      jobCategory: 'dev' as const,
      careerMin: 3,
      careerMax: null,
      location: '서울 강남구',
      employmentType: 'full_time' as const,
      description: '결제 API를 만들어요',
      skills: ['Kotlin'],
      deadline: null,
      requirements: ['Kotlin'],
      preferred: ['Kafka'],
      workConditions: { 근무: '주 5일' },
    }
    const detail = {
      id: 'p1',
      company: '푸시',
      title: '백엔드',
      jobCategory: 'dev' as const,
      imageUrl: null,
      skills: ['Kotlin'],
      careerMin: 3,
      careerMax: null,
      location: '서울 강남구',
      employmentType: 'full_time' as const,
      deadline: null,
      bookmarked: false,
      applied: false,
      sourceUrl: null,
      createdAt: '2026-10-21T00:00:00.000Z',
      description: '결제 API를 만들어요',
      requirements: ['Kotlin'],
      preferred: ['Kafka'],
      workConditions: { 근무: '주 5일' },
      revision: 1,
      closedAt: null,
    }
    const { api, hits } = harness(() => json(200, { data: detail }))
    await expect(api.postings.create(input)).resolves.toEqual(detail)
    await api.postings.update('p1', { expectedRevision: 4, title: '새 제목' })
    await api.postings.close('p1', 4)
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/postings')
    expect(bodyOf(hits[0]!)).toEqual(input)
    expect(hits[1]!.method).toBe('PATCH')
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/postings/p1')
    expect(bodyOf(hits[1]!)).toEqual({ expectedRevision: 4, title: '새 제목' })
    expect(hits[2]!.method).toBe('POST')
    expect(new URL(hits[2]!.url).pathname).toBe('/api/v1/postings/p1/close')
    expect(bodyOf(hits[2]!)).toEqual({ expectedRevision: 4 })
  })

  it('lists the signed-in company postings', async () => {
    const page = {
      data: [
        {
          id: 'job-1',
          company: '모아페이',
          title: '시니어 백엔드',
          jobCategory: 'dev' as const,
          imageUrl: null,
          skills: [] as string[],
          careerMin: 5,
          careerMax: null,
          location: '서울 강남구',
          employmentType: 'full_time' as const,
          deadline: null,
          bookmarked: false,
          applied: false,
          sourceUrl: null,
          createdAt: '2026-10-21T00:00:00.000Z',
          revision: 1,
          closedAt: null,
        },
      ],
      page: { nextCursor: null, hasMore: false, total: 1 },
    }
    const { api, hits } = harness(() => json(200, page))
    await expect(api.postings.mine()).resolves.toEqual(page)
    expect(hits[0]!.method).toBe('GET')
    expect(new URL(hits[0]!.url).pathname.endsWith('/companies/me/postings')).toBe(true)
  })

  it('lists applicants and loads one snapshot', async () => {
    const summary = {
      applicationId: 'a1',
      applicant: { displayName: '김서준', headline: null },
      stage: 'APPLIED' as const,
      appliedAt: '2026-10-20T00:00:00.000Z',
    }
    const detail = {
      application: {
        id: 'a1',
        revision: 1,
        jobId: 'p1',
        company: '푸시',
        title: '백엔드',
        stage: 'APPLIED' as const,
        appliedAt: '2026-10-20T00:00:00.000Z',
        createdAt: '2026-10-20T00:00:00.000Z',
        fitScore: 6.9,
      },
      documents: [{ id: 'd1', title: '이력서', content: '본문' }],
    }
    const page = { data: [summary], page: { nextCursor: null, hasMore: false, total: 1 } }
    const { api, hits } = harness((req) => {
      if (new URL(req.url).pathname.endsWith('/a1')) return json(200, { data: detail })
      return json(200, page)
    })
    await expect(api.postings.applicants('p1', { stage: 'SCREENING', limit: 20 })).resolves.toEqual(page)
    await expect(api.postings.applicant('p1', 'a1')).resolves.toEqual(detail)
    expect(decodeURIComponent(hits[0]!.url)).toBe('http://x/api/v1/postings/p1/applicants?stage=SCREENING&limit=20')
    expect(new URL(hits[1]!.url).pathname).toBe('/api/v1/postings/p1/applicants/a1')
  })

  it('reads consents and calendar events', async () => {
    const consent = { referenceData: false, updatedAt: null }
    const events = {
      data: [
        {
          id: 'e1',
          revision: 1,
          applicationId: null,
          type: 'DEADLINE' as const,
          title: '마감',
          startsAt: '2026-10-22T00:00:00.000Z',
          endsAt: '2026-10-22T01:00:00.000Z',
          timeZone: 'Asia/Seoul',
          source: 'LOCAL' as const,
          externalId: null,
          notes: '',
          createdAt: '2026-10-21T00:00:00.000Z',
          updatedAt: '2026-10-21T00:00:00.000Z',
        },
      ],
      page: { nextCursor: null, hasMore: false },
    }
    const { api, hits } = harness((req) => {
      if (new URL(req.url).pathname.endsWith('/consents')) return json(200, { data: consent })
      return json(200, events)
    })
    await expect(api.me.consents()).resolves.toEqual(consent)
    await expect(api.calendar.events('2026-10-01T00:00:00.000Z', '2026-10-31T00:00:00.000Z')).resolves.toEqual(events)
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/me/consents')
    expect(hits[0]!.method).toBe('GET')
    expect(decodeURIComponent(hits[1]!.url)).toBe(
      'http://x/api/v1/calendar/events?from=2026-10-01T00:00:00.000Z&to=2026-10-31T00:00:00.000Z',
    )
  })

  it('posts a conversation attachment as form data', async () => {
    const form = new FormData()
    form.append('file', new Blob(['pdf'], { type: 'application/pdf' }), 'resume.pdf')
    const { api, hits } = harness(() => json(201, { data: { id: 'att1' } }))
    await expect(api.conversations.attach('c1', form)).resolves.toEqual({ id: 'att1' })
    expect(hits[0]!.method).toBe('POST')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/conversations/c1/attachments')
    expect(hits[0]!.body).toContain('resume.pdf')
  })

  it('reads company billing and web notifications on the personal paths', async () => {
    const status = {
      subscriptionStatus: 'ACTIVE',
      plan: 'BASIC' as const,
      periodEndsAt: null,
      balanceMicroCredits: 1,
      reservedMicroCredits: 0,
      audience: 'EMPLOYER' as const,
    }
    const note = {
      id: 'n1',
      type: 'APPLICATION_STAGE' as const,
      title: '단계',
      body: '서류',
      target: { kind: 'activity' as const, id: 'applications' },
      readAt: null,
      createdAt: '2026-10-21T00:00:00.000Z',
    }
    const page = { data: [note], page: { nextCursor: null, hasMore: false } }
    const { api, hits } = harness((req) => {
      if (new URL(req.url).pathname.endsWith('/billing')) return json(200, { data: status })
      return json(200, page)
    })
    await expect(api.billing.companyStatus()).resolves.toEqual(status)
    await expect(api.me.webNotifications({ limit: 10 })).resolves.toEqual(page)
    expect(hits[0]!.method).toBe('GET')
    expect(new URL(hits[0]!.url).pathname).toBe('/api/v1/billing')
    expect(decodeURIComponent(hits[1]!.url)).toBe('http://x/api/v1/me/notifications?limit=10')
  })

  it('keeps employer fields optional on existing shapes', () => {
    const legacyBilling: BillingStatus = {
      subscriptionStatus: 'ACTIVE',
      plan: 'PRO',
      periodEndsAt: null,
      balanceMicroCredits: 0,
      reservedMicroCredits: 0,
    }
    const employerBilling: CompanyBillingStatus = {
      ...legacyBilling,
      plan: 'BASIC',
      audience: 'EMPLOYER',
      source: 'STRIPE',
    }
    const legacySettings: Settings = {
      notifyDeadline: true,
      notifyOffer: true,
      notifyComment: true,
      notifyAiDone: true,
      locale: 'ko',
      profilePublic: true,
      careerStatusVisibility: 'everyone',
      hideFromCurrentCompany: false,
      contactVisibility: 'everyone',
      defaultTone: 'as_is',
      chatRetentionDays: null,
      allowAiReadMyFiles: false,
    }
    const application: Application = {
      id: 'a1',
      revision: 2,
      jobId: 'j1',
      company: '푸시',
      title: '백엔드',
      stage: 'APPLIED',
      appliedAt: null,
      createdAt: '2026-10-20T00:00:00.000Z',
      fitScore: 6.9,
    }
    const posting: PostingDetail = {
      id: 'p1',
      company: '푸시',
      title: '백엔드',
      jobCategory: 'dev',
      imageUrl: null,
      skills: [],
      careerMin: 1,
      careerMax: null,
      location: '서울',
      employmentType: 'full_time',
      deadline: null,
      bookmarked: false,
      applied: false,
      sourceUrl: null,
      createdAt: '2026-10-21T00:00:00.000Z',
      description: '일',
      requirements: [],
      workConditions: {},
      preferred: ['Kafka'],
      revision: 3,
      closedAt: null,
    }
    const post: Post = {
      id: 'post1',
      author: { id: 'u1', displayName: '김서준', employer: true, companyName: '푸시' },
      category: 'work',
      title: '글',
      body: '본문',
      imageUrls: [],
      commentCount: 0,
      viewCount: 0,
      createdAt: '2026-10-21T00:00:00.000Z',
    }
    const legacySession: Session = {
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
      user: { id: 'u1', displayName: '김서준', locale: 'ko' },
    }
    const employerSession: Session = {
      ...legacySession,
      user: { ...legacySession.user, accountType: 'EMPLOYER', companyId: 'co1', companyRole: 'ADMIN' },
    }
    const note: WebNotification = {
      id: 'n1',
      type: 'APPLICATION_STAGE',
      title: '단계',
      body: '서류',
      target: { kind: 'activity', id: 'applications' },
      readAt: null,
      createdAt: '2026-10-21T00:00:00.000Z',
    }
    expect(legacyBilling.audience).toBeUndefined()
    expect(employerBilling.plan).toBe('BASIC')
    expect(legacySettings.notifyApplicationStage).toBeUndefined()
    expect({ ...legacySettings, notifyApplicationStage: true }.notifyApplicationStage).toBe(true)
    expect(application.fitScore).toBe(6.9)
    expect(posting.revision).toBe(3)
    expect(posting.closedAt).toBeNull()
    expect(posting.preferred).toEqual(['Kafka'])
    expect(post.author.companyName).toBe('푸시')
    expect(employerSession.user.companyRole).toBe('ADMIN')
    expect(note.target.kind).toBe('activity')
  })
})
