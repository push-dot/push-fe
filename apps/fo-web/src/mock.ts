// Dev fixtures for ?mock=1 (or window.__PUSH__.mock), matching the Claude Design boards.
// shortcut: every id returns the same sample; drop once push-be v2 serves these endpoints.
import type { Post, Posting, PostingDetail, Profile, Session } from '@push/api-client'
import { sessionStore } from './shared/auth/session'
import { searchHangul } from './shared/lib/hangul-search'

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

const DAY_MS = 86_400_000
const DEADLINE_ORIGIN = Date.parse('2026-10-21T00:00:00Z')
const POPULAR_ORDER = ['p4', 'p2', 'p5', 'p1', 'p3']

const listings: Posting[] = [
  {
    id: 'p1',
    company: '모아페이',
    title: '백엔드 엔지니어 (Kotlin·Spring)',
    jobCategory: 'dev',
    imageUrl: null,
    skills: ['Kotlin', 'Java', 'Spring'],
    careerMin: 4,
    careerMax: 6,
    location: '서울 강남구',
    employmentType: 'full_time',
    deadline: '2026-11-02',
    bookmarked: true,
    applied: false,
    sourceUrl: 'https://careers.moapay.kr/jobs/1182',
    createdAt: '2026-10-19T09:00:00Z',
  },
  {
    id: 'p2',
    company: '누리클라우드',
    title: '프론트엔드 개발자',
    jobCategory: 'dev',
    imageUrl: null,
    skills: ['React', 'TypeScript'],
    careerMin: 1,
    careerMax: 3,
    location: '서울 강남구',
    employmentType: 'full_time',
    deadline: '2026-10-24',
    bookmarked: false,
    applied: false,
    sourceUrl: null,
    createdAt: '2026-10-18T09:00:00Z',
  },
  {
    id: 'p3',
    company: '하루랩스',
    title: '프로덕트 디자이너',
    jobCategory: 'design',
    imageUrl: null,
    skills: ['Figma'],
    careerMin: 4,
    careerMax: 6,
    location: '원격',
    employmentType: 'contract',
    deadline: '2026-10-27',
    bookmarked: false,
    applied: false,
    sourceUrl: null,
    createdAt: '2026-10-17T09:00:00Z',
  },
  {
    id: 'p4',
    company: '핀다',
    title: '데이터 분석가',
    jobCategory: 'data',
    imageUrl: null,
    skills: ['Python', 'AWS'],
    careerMin: 0,
    careerMax: null,
    location: '서울 성동구',
    employmentType: 'intern',
    deadline: '2026-10-22',
    bookmarked: false,
    applied: false,
    sourceUrl: null,
    createdAt: '2026-10-16T09:00:00Z',
  },
  {
    id: 'p5',
    company: '북엔드',
    title: 'iOS 엔지니어',
    jobCategory: 'dev',
    imageUrl: null,
    skills: ['Swift'],
    careerMin: 7,
    careerMax: 9,
    location: '부산 해운대구',
    employmentType: 'full_time',
    deadline: '2026-12-01',
    bookmarked: false,
    applied: false,
    sourceUrl: null,
    createdAt: '2026-10-20T09:00:00Z',
  },
]

const flags = new Map<string, { bookmarked: boolean; applied: boolean }>(
  listings.map((item) => [item.id, { bookmarked: item.bookmarked, applied: item.applied }]),
)

const present = (item: Posting): Posting => {
  const flag = flags.get(item.id)
  return flag ? { ...item, bookmarked: flag.bookmarked, applied: flag.applied } : item
}

const splitParam = (url: URL, key: string) =>
  (url.searchParams.get(key) ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

const deadlineSoon = (deadline: string | null) => {
  if (!deadline) return false
  const when = Date.parse(`${deadline.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(when)) return false
  const days = Math.round((when - DEADLINE_ORIGIN) / DAY_MS)
  return days >= 0 && days <= 7
}

const CAREER_SPAN: Record<string, [number, number]> = {
  '0': [0, 0],
  '1-3': [1, 3],
  '4-6': [4, 6],
  '7-9': [7, 9],
  '10+': [10, 100],
}

const careerSpan = (item: Posting): [number, number] =>
  item.careerMin === 0 && item.careerMax == null ? [0, 0] : [item.careerMin, item.careerMax ?? 100]

const careerOverlaps = (item: Posting, key: string) => {
  const span = CAREER_SPAN[key]
  if (!span) return false
  const [low, high] = careerSpan(item)
  return low <= span[1] && high >= span[0]
}

const filteredPostings = (url: URL) => {
  const categories = splitParam(url, 'category')
  const skills = splitParam(url, 'skills')
  const years = splitParam(url, 'careerYears')
  const places = splitParam(url, 'location')
  const employment = splitParam(url, 'employmentType')
  const sort = url.searchParams.get('sort') ?? 'latest'
  let items = listings.filter((item) => {
    if (categories.length > 0 && !categories.includes(item.jobCategory)) return false
    if (skills.length > 0 && !skills.some((skill) => item.skills.includes(skill))) return false
    if (years.length > 0 && !years.some((year) => careerOverlaps(item, year))) return false
    if (places.length > 0 && !places.includes(item.location)) return false
    if (employment.length > 0 && !employment.includes(item.employmentType)) return false
    if (sort === 'deadline' && !deadlineSoon(item.deadline)) return false
    return true
  })
  if (sort === 'popular') items = [...items].sort((a, b) => POPULAR_ORDER.indexOf(a.id) - POPULAR_ORDER.indexOf(b.id))
  else if (sort === 'deadline') items = [...items].sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
  else items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items.map(present)
}

const pageOf = (url: URL, items: Posting[]) => {
  const rawLimit = Number(url.searchParams.get('limit') ?? items.length)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : items.length
  const cursor = url.searchParams.get('cursor')
  const found = cursor ? items.findIndex((item) => item.id === cursor) : -1
  const start = found >= 0 ? found + 1 : 0
  const data = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  return {
    data,
    page: { nextCursor: hasMore ? (data[data.length - 1]?.id ?? null) : null, hasMore, total: items.length },
  }
}

const searchPerson: Profile = {
  ...profile,
  userId: 'u-seojun',
  displayName: '김서준',
  headline: '백엔드로 결제 시스템을 만들어요',
}

const searchPost: Post = {
  id: 'post-1',
  author: { id: 'u-seojun', displayName: '김서준', avatarUrl: null },
  category: 'career',
  title: '모아페이 면접 후기',
  body: '백엔드 면접에서 결제 승인을 깊게 물어봤어요',
  imageUrls: [],
  commentCount: 3,
  viewCount: 42,
  createdAt: '2026-10-20T01:00:00.000Z',
}

const flagFor = (id: string) => flags.get(id) ?? { bookmarked: id === posting.id ? posting.bookmarked : false, applied: false }

const setFlag = (id: string, patch: Partial<{ bookmarked: boolean; applied: boolean }>) => {
  flags.set(id, { ...flagFor(id), ...patch })
}

export const mockFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(requestUrl, typeof location === 'undefined' ? 'http://localhost' : location.href)
  const pathname = url.pathname
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  await new Promise((resolve) => setTimeout(resolve, 250))
  if (method === 'GET' && pathname.endsWith('/postings/locations')) {
    return json(200, {
      data: [
        { location: '서울 강남구', count: 2 },
        { location: '원격', count: 1 },
      ],
    })
  }
  const bookmarkMatch = pathname.match(/\/postings\/([^/]+)\/bookmark$/)
  if (bookmarkMatch && (method === 'POST' || method === 'DELETE')) {
    setFlag(bookmarkMatch[1] ?? '', { bookmarked: method === 'POST' })
    return new Response(null, { status: 204 })
  }
  const applyMatch = pathname.match(/\/postings\/([^/]+)\/apply$/)
  if (applyMatch && method === 'POST') {
    const id = applyMatch[1] ?? ''
    setFlag(id, { applied: true })
    const item = listings.find((row) => row.id === id)
    const now = new Date().toISOString()
    return json(200, {
      data: {
        id: 'app-1',
        revision: 1,
        jobId: id,
        company: item?.company ?? posting.company,
        title: item?.title ?? posting.title,
        stage: 'APPLIED',
        appliedAt: now,
        createdAt: now,
      },
    })
  }
  if (method === 'GET' && /\/postings\/?$/.test(pathname)) return json(200, pageOf(url, filteredPostings(url)))
  if (method === 'GET' && /\/search\/?$/.test(pathname)) {
    const q = url.searchParams.get('q') ?? ''
    const type = url.searchParams.get('type') ?? 'postings'
    if (type === 'people') {
      const data = searchHangul([searchPerson], q, (item) => [item.displayName, item.headline]).map((row) => row.item)
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (type === 'posts') {
      const data = searchHangul([searchPost], q, (item) => [item.title, item.body]).map((row) => row.item)
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    const data = q.trim()
      ? searchHangul(listings, q, (item) => [item.company, item.title]).map((row) => present(row.item))
      : listings.map(present)
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && /\/sources\/?$/.test(pathname)) {
    return json(200, {
      data: [
        {
          id: 'src-resume',
          fileName: '김서준_이력서.pdf',
          mimeType: 'application/pdf',
          size: 120000,
          sha256: 'abc',
          status: 'READY',
        },
        {
          id: 'src-extra',
          fileName: '김서준_포트폴리오.pdf',
          mimeType: 'application/pdf',
          size: 84000,
          sha256: 'def',
          status: 'READY',
        },
      ],
      page: { nextCursor: null, hasMore: false },
    })
  }
  if (method === 'GET' && /\/postings\/[^/]+$/.test(pathname)) {
    const id = pathname.match(/\/postings\/([^/]+)$/)?.[1] ?? posting.id
    const flag = flags.get(id)
    return json(200, {
      data: {
        ...posting,
        id,
        bookmarked: flag?.bookmarked ?? posting.bookmarked,
        applied: flag?.applied ?? posting.applied,
      },
    })
  }
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
