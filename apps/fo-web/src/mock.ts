// Dev fixtures for ?mock=1 (or window.__PUSH__.mock), matching the Claude Design boards.
// shortcut: every id returns the same sample; drop once push-be v2 serves these endpoints.
import type { PostingDetail, Profile, Session } from '@push/api-client'
import { sessionStore } from './shared/auth/session'

/** Fields the boards show but api-spec §4 doesn't define yet. */
export type PostingView = PostingDetail & { industry?: string; preferred?: string[] }

export type Fit = {
  document: string
  score: number
  parts: { label: string; value: number }[]
  weakness: string
  /** "조금만 고치면 N점대예요" */
  reachable: number
}

const posting: PostingView = {
  id: 'p1',
  company: '모아페이',
  industry: '핀테크',
  title: '백엔드 엔지니어 (Kotlin·Spring)',
  jobCategory: 'dev',
  imageUrl: null,
  skills: ['Kotlin', 'Spring Boot', 'JPA', 'Kafka'],
  careerMin: 4,
  careerMax: 6,
  location: '서울 강남구',
  employmentType: 'full_time',
  deadline: '2026-11-02',
  bookmarked: true,
  applied: false,
  sourceUrl: 'https://careers.moapay.kr/jobs/1182',
  createdAt: '2026-10-19T09:00:00Z',
  description: '결제 승인·취소 API를 설계하고 개발해요\n정산 배치의 성능과 정확도를 높여요',
  requirements: ['Kotlin 또는 Java로 4년 이상 서버 개발', 'Spring Boot, JPA 실무 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시징 시스템 운영 경험'],
  workConditions: { 근무: '주 5일, 유연 출퇴근 (코어 11–16시)', 보상: '연봉 협의 · 스톡옵션' },
}

const profile: Profile = {
  userId: 'u-haeun',
  displayName: '이하은',
  avatarUrl: null,
  headline: 'React로 사용자 경험을 다듬어요',
  jobCategory: 'dev',
  tenureYears: 4,
  careerStatus: 'seeking',
  openToOffers: true,
  intro: '커머스와 SaaS 제품에서 프론트엔드를 맡아 왔어요. 디자인 시스템을 만들고, 느린 화면을 빠르게 바꾸는 일을 좋아해요.',
  careers: [
    { company: '누리클라우드', role: '프론트엔드 개발자', startedOn: '2023-03-01', endedOn: null, description: '관리자 콘솔을 Next.js로 옮기고 디자인 시스템을 만들었어요.' },
    { company: '하루랩스', role: '웹 개발자', startedOn: '2021-07-01', endedOn: '2023-02-28', description: '' },
  ],
  skills: ['React', 'TypeScript', 'Next.js', 'Zustand', 'Storybook'],
  followerCount: 128,
  resumeSourceId: null,
  updatedAt: '2026-10-18T09:00:00Z',
  following: false,
}

export const mockFit: Fit = {
  document: '김서준_백엔드_이력서_2026',
  score: 6.9,
  parts: [
    { label: '기술 스택', value: 8.2 },
    { label: '경험 연관성', value: 7.4 },
    { label: '키워드', value: 4.5 },
  ],
  weakness: 'Kafka 운영 경험과 부하 테스트 근거가 부족해요',
  reachable: 8,
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export type MockPersona = 'personal' | 'employer' | 'employer-pro' | 'employer-new'

const PERSONAS: MockPersona[] = ['personal', 'employer', 'employer-pro', 'employer-new']

let persona: MockPersona | null = null
let signupEmail = ''

export const mockPersona = () => persona

export const setMockPersona = (value: string | null | undefined) => {
  persona = PERSONAS.find((item) => item === value) ?? null
}

export const mockSession = (kind: MockPersona): Session => {
  if (kind === 'employer' || kind === 'employer-pro') {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: 'u1',
        displayName: '모아페이',
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: 'co-1',
        companyRole: 'ADMIN',
      },
    }
  }
  if (kind === 'employer-new') {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: 'u1',
        displayName: '새 담당자',
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: null,
        companyRole: null,
      },
    }
  }
  return {
    accessToken: 'mock-access',
    refreshToken: 'mock-refresh',
    expiresIn: 900,
    user: {
      id: 'u1',
      displayName: '김서준',
      locale: 'ko',
      accountType: 'PERSONAL',
      companyId: null,
      companyRole: null,
    },
  }
}

const loginPersona = (email: string): MockPersona => {
  if (email.startsWith('employer-new')) return 'employer-new'
  if (email.startsWith('employer')) return 'employer'
  return persona ?? 'personal'
}

const readJson = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    if (input instanceof Request) return (await input.clone().json()) as Record<string, unknown>
    if (typeof init?.body === 'string') return JSON.parse(init.body) as Record<string, unknown>
    return {}
  } catch {
    return {}
  }
}

const matches = (pathname: string, suffix: string) => pathname === suffix || pathname.endsWith(suffix)

export const mockFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const pathname = new URL(requestUrl, typeof location === 'undefined' ? 'http://localhost' : location.href).pathname
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  await new Promise((resolve) => setTimeout(resolve, 250))
  if (/\/postings\/[^/]+$/.test(pathname)) return json(200, { data: posting })
  if (/\/profiles\/[^/]+$/.test(pathname)) return json(200, { data: profile })
  if (method === 'POST' && matches(pathname, '/auth/email/signup')) {
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    if (email === 'taken@push.app') {
      return json(409, {
        error: { code: 'EMAIL_TAKEN', message: 'taken', details: { accountType: 'PERSONAL' } },
      })
    }
    signupEmail = email
    return new Response(null, { status: 202 })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/login')) {
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    const password = String(payload.password ?? '')
    if (password.length < 8 || email === 'bad@push.app') {
      return json(401, { error: { code: 'INVALID_CREDENTIALS', message: 'no' } })
    }
    if (email === 'unverified@push.app') {
      return json(403, { error: { code: 'EMAIL_NOT_VERIFIED', message: 'unverified' } })
    }
    return json(200, { data: mockSession(loginPersona(email)) })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/verify')) {
    const payload = await readJson(input, init)
    const token = String(payload.token ?? '')
    if (token === 'bad') return json(400, { error: { code: 'INVALID_TOKEN', message: 'bad' } })
    const kind = token === 'employer' || signupEmail.startsWith('employer') ? 'employer-new' : 'personal'
    return json(200, { data: mockSession(kind) })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/password-reset/confirm')) {
    return new Response(null, { status: 204 })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/password-reset')) {
    return new Response(null, { status: 202 })
  }
  if (method === 'POST' && matches(pathname, '/auth/exchange')) {
    return json(200, { data: mockSession(persona ?? 'personal') })
  }
  if (method === 'GET' && matches(pathname, '/auth/me')) {
    const user = sessionStore.load()?.user
    return json(200, {
      data: {
        id: user?.id ?? 'u1',
        displayName: user?.displayName ?? '김서준',
        locale: user?.locale ?? 'ko',
        createdAt: '2026-10-01T00:00:00.000Z',
        accountType: user?.accountType ?? 'PERSONAL',
        companyId: user?.companyId ?? null,
        companyRole: user?.companyRole ?? null,
      },
    })
  }
  if (method === 'POST' && matches(pathname, '/auth/refresh')) {
    return json(200, { data: sessionStore.load() ?? mockSession(persona ?? 'personal') })
  }
  return json(404, { error: { code: 'NOT_FOUND', message: `mock: ${pathname}` } })
}
