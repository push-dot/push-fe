import type {
  Application,
  Comment,
  Company,
  CompanyBillingStatus,
  CompanyMember,
  Consent,
  Conversation,
  EmploymentType,
  JobCategory,
  Message,
  Offer,
  OfferMessage,
  Post,
  Posting,
  PostingDetail,
  Profile,
  Session,
  Settings,
  Source,
  UserLink,
  WebNotification,
} from '@push/api-client'
import { searchHangul } from '@push/shared'
import { sessionStore } from '../auth/session'
import { isWebView } from '../lib/bridge'
import { SEAT_LIMIT_NONE, SEAT_LIMIT_PRO, SEAT_LIMIT_ULTRA } from '../model/constants'
import { assistantReply, type ChatIntent } from '../model/employer-chat'
import {
  APP_DEADLINE_DAYS,
  APP_POSTING_BODY,
  APP_PROFILES,
  APPLICANT_SEEDS,
  CHAT_SEEDS,
  DRAFT_REPLY,
  APPLICATIONS,
  CALENDAR_EVENTS,
  CATALOG_TOTALS,
  COMMENT_THREADS,
  EMPLOYER_NOTICES,
  FEED,
  HUB_PROFILES,
  LISTINGS,
  ME_PROFILE,
  MY_POSTS,
  OFFER_THREADS,
  POPULAR_ORDER,
  POSTING_DETAILS,
  RECEIVED_OFFERS,
  SEARCH_BOARDS,
  SEED_LINKS,
  SEED_NOTICES,
  SEED_SOURCES,
  SENT_OFFERS,
  type PostingView,
} from './mock-fixtures'

export type { PostingView }

export type Fit = {
  document: string
  score: number
  parts: { label: string; value: number }[]
  weakness: string
  reachable: number
}

export const mockFit: Fit = {
  document: '김서준_백엔드_이력서_2026',
  score: 6.9,
  parts: [
    { label: '기술 스택', value: 7.5 },
    { label: '경험 연관성', value: 7 },
    { label: '경력 수준', value: 8 },
    { label: '키워드', value: 4.5 },
    { label: '도메인', value: 5 },
  ],
  weakness: 'Kafka 운영 경험과 부하 테스트 근거가 부족해요',
  reachable: 8,
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const MEMBER_EMAIL = 'mina.lee@moapay.kr'

export type MockPersona = 'personal' | 'employer' | 'employer-pro' | 'employer-ultra' | 'employer-new'

const PERSONAS: MockPersona[] = ['personal', 'employer', 'employer-pro', 'employer-ultra', 'employer-new']

let persona: MockPersona | null = null
let signupEmail = ''
const TAKEN_EMAILS = ['taken@push.app', 'seojun.kim@gmail.com']

export const mockPersona = () => persona

export const setMockPersona = (value: string | null | undefined) => {
  persona = PERSONAS.find((item) => item === value) ?? null
}

export const mockSession = (kind: MockPersona): Session => {
  if (kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra') {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: 'u1',
        displayName: '이민아',
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
        displayName: MEMBER_EMAIL,
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

const readForm = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    if (input instanceof Request) return await input.clone().formData()
    if (typeof FormData !== 'undefined' && init?.body instanceof FormData) return init.body
  } catch {
    return null
  }
  return null
}

const matches = (pathname: string, suffix: string) => pathname === suffix || pathname.endsWith(suffix)

const DAY_MS = 86_400_000
const DEADLINE_ORIGIN = Date.parse('2026-10-21T00:00:00Z')
const HOME_RAIL_SIZE = 5

const listings: Posting[] = LISTINGS.map((item) => ({ ...item }))

const flags = new Map<string, { bookmarked: boolean; applied: boolean }>(
  listings.map((item) => [item.id, { bookmarked: item.bookmarked, applied: item.applied }]),
)

const signedOf = (input: RequestInfo | URL, init?: RequestInit) =>
  new Headers(input instanceof Request ? input.headers : init?.headers).has('Authorization')

const present = (item: Posting, signed: boolean): Posting => {
  const flag = flags.get(item.id)
  if (!signed) return { ...item, bookmarked: false, applied: false }
  return flag ? { ...item, bookmarked: flag.bookmarked, applied: flag.applied } : item
}

const localDateIn = (days: number) => {
  const at = new Date(Date.now() + days * DAY_MS)
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`
}

const detailFor = (item: Posting, signed: boolean): PostingView => {
  const shown = present(item, signed)
  if (isWebView() && shown.id === 'p1') return { ...shown, ...APP_POSTING_BODY, deadline: localDateIn(APP_DEADLINE_DAYS) } as PostingView
  const detail = POSTING_DETAILS[shown.id]
  if (detail) return { ...shown, ...detail } as PostingView
  return {
    ...shown,
    description: `${shown.company}에서 ${shown.title}를 채용해요`,
    requirements: shown.skills,
    preferred: [],
    workConditions: {},
  }
}

type CompanyPosting = PostingDetail & { revision: number; closedAt: string | null }

const JOB_CATEGORY_KEYS = ['dev', 'data', 'design', 'plan', 'marketing', 'sales', 'hr', 'ops'] as const
const EMPLOYMENT_TYPE_KEYS = ['full_time', 'contract', 'intern', 'freelance', 'dispatch'] as const
const APPLICATION_STAGES = [
  'DISCOVERED',
  'PREPARING',
  'READY',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'ACCEPTED',
  'REJECTED',
  'WITHDRAWN',
] as const
const TERMINAL_APPLICANT_STAGES = new Set<Application['stage']>(['REJECTED', 'ACCEPTED', 'WITHDRAWN'])

const asJobCategory = (value: unknown): JobCategory => JOB_CATEGORY_KEYS.find((key) => key === value) ?? 'dev'

const asEmploymentType = (value: unknown): EmploymentType => EMPLOYMENT_TYPE_KEYS.find((key) => key === value) ?? 'full_time'

const asStage = (value: unknown) => APPLICATION_STAGES.find((stage) => stage === value) ?? null

const stringList = (value: unknown) => (Array.isArray(value) ? value.map(String) : [])

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const careerMinOf = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const deadlineOf = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)

const companyPosting = (patch: Partial<CompanyPosting> & Pick<CompanyPosting, 'id' | 'title'>): CompanyPosting => ({
  company: '모아페이',
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMin: 5,
  careerMax: null,
  location: '서울 강남구',
  employmentType: 'full_time',
  deadline: '2026-11-30',
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  createdAt: '2026-10-21T00:00:00.000Z',
  description: '결제 승인 API를 설계해요',
  requirements: ['서버 개발 5년'],
  preferred: ['금융 도메인'],
  workConditions: { 조건: '주 5일' },
  revision: 1,
  closedAt: null,
  ...patch,
})

const POSTING_DRAFT_BODY: Partial<CompanyPosting> = {
  description: [
    '하루 2,000만 건 결제 승인 API를 설계하고 성능을 개선해요',
    '거래액 증가에 맞춰 확장 가능한 구조로 바꿔요',
    '장애 대응 체계와 모니터링을 함께 만들어요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java 서버 개발 4년 이상', '대용량 트래픽 API 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시지 큐 운영 경험'],
  workConditions: { 근무: '주 3일 출근 · 유연 근무', 근무지: '서울 강남구 테헤란로 152' },
}

const companyPostings: CompanyPosting[] = [
  companyPosting({
    id: 'job-1',
    title: '결제 승인 백엔드 엔지니어 (Kotlin)',
    careerMin: 4,
    careerMax: 6,
    location: '서울 강남구 테헤란로 152',
    deadline: '2026-11-03',
    skills: ['Kotlin', 'Spring Boot', 'MySQL', 'Kafka'],
    createdAt: '2026-10-20T01:00:00.000Z',
    ...POSTING_DRAFT_BODY,
  }),
  companyPosting({
    id: 'job-2',
    title: '결제 플랫폼 시니어 엔지니어',
    careerMin: 7,
    careerMax: 9,
    deadline: '2026-11-20',
    createdAt: '2026-10-19T01:00:00.000Z',
  }),
  companyPosting({
    id: 'job-3',
    title: '정산 데이터 엔지니어',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-18T01:00:00.000Z',
  }),
  companyPosting({
    id: 'job-4',
    title: '데이터 엔지니어',
    jobCategory: 'data',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-20T00:00:00.000Z',
  }),
  companyPosting({
    id: 'job-5',
    title: 'iOS 개발자',
    careerMin: 1,
    careerMax: 3,
    deadline: null,
    closedAt: '2026-09-30T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
  }),
]

let companyPostingSeq = companyPostings.length

const employerOwnsPostings = () =>
  persona === 'employer' || persona === 'employer-pro' || persona === 'employer-ultra' || persona === 'employer-new'

const toCard = (item: CompanyPosting): Posting => ({
  id: item.id,
  company: item.company,
  title: item.title,
  jobCategory: item.jobCategory,
  imageUrl: item.imageUrl,
  skills: item.skills,
  careerMin: item.careerMin,
  careerMax: item.careerMax,
  location: item.location,
  employmentType: item.employmentType,
  deadline: item.deadline,
  bookmarked: item.bookmarked,
  applied: item.applied,
  sourceUrl: item.sourceUrl,
  createdAt: item.createdAt,
  revision: item.revision,
  closedAt: item.closedAt,
})

type ApplicantRecord = {
  application: Application
  displayName: string
  headline: string
  documents: { id: string; title: string; content: string }[]
}

const applicantRecord = (seed: (typeof APPLICANT_SEEDS)[number]): ApplicantRecord => ({
  application: {
    id: seed.id,
    revision: 1,
    jobId: 'job-1',
    company: '모아페이',
    title: '결제 승인 백엔드 엔지니어 (Kotlin)',
    stage: seed.stage,
    appliedAt: seed.appliedAt,
    createdAt: seed.appliedAt,
  },
  displayName: seed.displayName,
  headline: seed.headline,
  documents: seed.documents,
})

const applicantsByPosting = new Map<string, ApplicantRecord[]>([['job-1', APPLICANT_SEEDS.map(applicantRecord)]])

const syncListing = (item: CompanyPosting) => {
  const listing = listings.find((row) => row.id === item.id)
  if (listing) Object.assign(listing, toCard(item))
}

const applyPostingPatch = (item: CompanyPosting, payload: Record<string, unknown>) => {
  if (typeof payload.title === 'string') item.title = payload.title
  if (typeof payload.description === 'string') item.description = payload.description
  if (Array.isArray(payload.requirements)) item.requirements = stringList(payload.requirements)
  if (Array.isArray(payload.preferred)) item.preferred = stringList(payload.preferred)
  if ('workConditions' in payload) item.workConditions = recordOf(payload.workConditions)
  if ('jobCategory' in payload) item.jobCategory = asJobCategory(payload.jobCategory)
  if ('careerMin' in payload) item.careerMin = careerMinOf(payload.careerMin)
  if ('careerMax' in payload) item.careerMax = typeof payload.careerMax === 'number' ? payload.careerMax : null
  if (typeof payload.location === 'string') item.location = payload.location
  if ('employmentType' in payload) item.employmentType = asEmploymentType(payload.employmentType)
  if ('deadline' in payload) item.deadline = deadlineOf(payload.deadline)
  if (Array.isArray(payload.skills)) item.skills = stringList(payload.skills)
  item.revision += 1
}

const revisionConflict = (currentRevision: number) =>
  json(409, {
    error: { code: 'REVISION_CONFLICT', message: '공고가 이미 바뀌었어요', details: { currentRevision } },
  })

const ownedPostingResponse = (id: string) => {
  const owned = companyPostings.find((item) => item.id === id)
  if (!owned) return null
  const flag = flags.get(id)
  return json(200, {
    data: {
      ...owned,
      bookmarked: flag?.bookmarked ?? owned.bookmarked,
      applied: flag?.applied ?? owned.applied,
    },
  })
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

const filteredPostings = (url: URL, signed: boolean) => {
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
    if ((sort === 'deadline' || url.searchParams.get('deadlineWithin') === '7') && !deadlineSoon(item.deadline)) return false
    return true
  })
  if (sort === 'popular') items = [...items].sort((a, b) => popularRank(a.id) - popularRank(b.id))
  else if (sort === 'deadline') items = [...items].sort((a, b) => (a.deadline ?? '').localeCompare(b.deadline ?? ''))
  else items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return items.map((item) => present(item, signed))
}

const pageOf = (url: URL, items: Posting[], defaultLimit = items.length, total = items.length) => {
  const rawLimit = Number(url.searchParams.get('limit') ?? defaultLimit)
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : items.length
  const cursor = url.searchParams.get('cursor')
  const found = cursor ? items.findIndex((item) => item.id === cursor) : -1
  const start = found >= 0 ? found + 1 : 0
  const data = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  return {
    data,
    page: { nextCursor: hasMore ? (data[data.length - 1]?.id ?? null) : null, hasMore, total },
  }
}

const popularRank = (id: string) => {
  const at = POPULAR_ORDER.indexOf(id)
  return at < 0 ? POPULAR_ORDER.length : at
}

const NARROWING_FILTERS = ['skills', 'careerYears', 'location', 'employmentType']

const REPEAT_MARK = '~'

const catalogPage = (url: URL, items: Posting[]) => {
  const narrowed = NARROWING_FILTERS.some((key) => splitParam(url, key).length > 0) || url.searchParams.get('deadlineWithin') === '7'
  const total = narrowed || items.length === 0 ? 0 : (CATALOG_TOTALS[splitParam(url, 'category').sort().join(',')] ?? 0)
  const catalog =
    total > items.length
      ? Array.from({ length: total }, (_, at) => {
          const item = items[at % items.length]!
          return at < items.length ? item : { ...item, id: `${item.id}${REPEAT_MARK}${Math.floor(at / items.length)}` }
        })
      : items
  return pageOf(url, catalog, HOME_RAIL_SIZE)
}

let links: UserLink[] = SEED_LINKS.map((item) => ({ ...item }))

const hubProfiles: Profile[] = HUB_PROFILES.map((item) => ({ ...item }))

const socialFlags = new Map<string, { following: boolean; offered: boolean }>(
  ['u-taeyoon', 'u-haeun', 'u-jiwoo', 'u-minjae', 'u-junho'].map((id) => [id, { following: true, offered: false }]),
)

const withFlags = (item: Profile): Profile => {
  const flag = socialFlags.get(item.userId)
  return { ...item, following: flag?.following ?? false, offered: flag?.offered ?? false }
}

const profileById = (id: string): Profile =>
  withFlags(hubProfiles.find((item) => item.userId === id) ?? { ...HUB_PROFILES[0]!, userId: id })

let meProfile: Profile = { ...ME_PROFILE }

let feed: Post[] = FEED.map((item) => ({ ...item }))

// shortcut: 김서준's seeded posts stay out of the /posts feed because WebSocial draws none of them; merge them once the boards agree.
const myPosts: Post[] = MY_POSTS.map((item) => ({ ...item }))

const postById = (id: string) => feed.find((item) => item.id === id) ?? myPosts.find((item) => item.id === id)

const commentThreads = new Map<string, Comment[]>(COMMENT_THREADS.map(([id, list]) => [id, list.map((item) => ({ ...item }))]))

let receivedOffers: Offer[] = RECEIVED_OFFERS.map((item) => ({ ...item }))

let sentOffers: Offer[] = SENT_OFFERS.map((item) => ({ ...item }))

const offerThreads = new Map<string, OfferMessage[]>(OFFER_THREADS.map(([id, list]) => [id, list.map((item) => ({ ...item }))]))

const offerById = (id: string) => receivedOffers.find((item) => item.id === id) ?? sentOffers.find((item) => item.id === id)

let notices: WebNotification[] = SEED_NOTICES.map((item) => ({ ...item }))
let employerNotices: WebNotification[] = EMPLOYER_NOTICES.map((item) => ({ ...item }))

const noticeBox = () => (employerPersona() ? employerNotices : notices)
const setNoticeBox = (next: WebNotification[]) => {
  if (employerPersona()) employerNotices = next
  else notices = next
}

let settings: Settings = {
  notifyDeadline: true,
  notifyOffer: true,
  notifyComment: true,
  notifyAiDone: true,
  notifyApplicationStage: true,
  locale: 'ko',
  profilePublic: true,
  careerStatusVisibility: 'everyone',
  hideFromCurrentCompany: false,
  contactVisibility: 'accepted',
  defaultTone: 'as_is',
  chatRetentionDays: null,
  allowAiReadMyFiles: false,
  aiAccessMode: 'AUTO',
  defaultEffort: 'MEDIUM',
  confirmBeforeEdit: true,
}

let consent: Consent = { referenceData: false, updatedAt: null }

const applications: Application[] = APPLICATIONS.map((item) => ({ ...item }))

const calendarEvents = CALENDAR_EVENTS.map((item) => ({ ...item }))

const seedSources: Source[] = SEED_SOURCES.map((item) => ({ ...item }))

const uploadedSources: Source[] = []

const allSources = () => [...uploadedSources, ...seedSources]

const libraryItem = (source: Source) => ({
  id: source.id,
  fileName: source.fileName,
  mimeType: source.mimeType,
  size: source.size,
  pageCount: null,
  createdAt: source.createdAt ?? null,
  origin: source.kind === 'AI_MADE' ? 'AI' : 'UPLOAD',
})

const employerPersona = () => {
  const kind = mockPersona()
  return kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra' || kind === 'employer-new'
}

type CompanyInvite = { id: string; email: string; expiresAt: string }

type CompanyRecord = {
  company: Company
  members: CompanyMember[]
  invites: CompanyInvite[]
}

const INVITE_MS = 7 * 86_400_000

const pendingInvite = (email: string): CompanyInvite => ({
  id: `inv-${++inviteSeq}`,
  email,
  expiresAt: new Date(Date.now() + INVITE_MS).toISOString(),
})

const companyRecords = new Map<string, CompanyRecord>()

let inviteSeq = 0

const personaKey = () => mockPersona() ?? 'default'

const currentUserId = () => sessionStore.load()?.user.id ?? 'u1'

const adminMember = (joinedAt: string): CompanyMember => ({
  userId: currentUserId(),
  email: MEMBER_EMAIL,
  role: 'ADMIN',
  joinedAt,
})

const COMPANY_BRAND = '모아페이'
const COMPANY_BNO = '2148703921'

const seedCompany = (): CompanyRecord | null => {
  const kind = mockPersona()
  const verifiedAt = '2026-09-01T00:00:00.000Z'
  if (kind === 'employer') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        plan: 'BASIC',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 0, limit: 0 },
      },
      members: [adminMember(verifiedAt)],
      invites: [],
    }
  }
  if (kind === 'employer-pro') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        plan: 'PRO',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 1, limit: 2 },
      },
      members: [
        adminMember(verifiedAt),
        { userId: 'u-member', email: 'jiho.han@moapay.kr', role: 'MEMBER', joinedAt: '2026-09-02T00:00:00.000Z' },
      ],
      invites: [],
    }
  }
  if (kind === 'employer-ultra') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        plan: 'ULTRA',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 0, limit: 5 },
      },
      members: [adminMember(verifiedAt)],
      invites: [],
    }
  }
  return null
}

const companyRecord = (): CompanyRecord | null => {
  const key = personaKey()
  const existing = companyRecords.get(key)
  if (existing) return existing
  const seeded = seedCompany()
  if (!seeded) return null
  companyRecords.set(key, seeded)
  return seeded
}

const companyMe = (): Company | null => companyRecord()?.company ?? null

const rememberCompany = (record: CompanyRecord) => {
  companyRecords.set(personaKey(), record)
}

const routeTail = (pathname: string) => {
  const marker = '/api/v1'
  const at = pathname.indexOf(marker)
  const tail = (at >= 0 ? pathname.slice(at + marker.length) : pathname).replace(/\/+$/, '')
  return tail || '/'
}

const slicePage = <T,>(url: URL, items: T[], idOf: (item: T) => string) => {
  const rawLimit = Number(url.searchParams.get('limit') ?? String(items.length || 1))
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : items.length || 1
  const cursor = url.searchParams.get('cursor')
  const found = cursor ? items.findIndex((item) => idOf(item) === cursor) : -1
  const start = found >= 0 ? found + 1 : 0
  const data = items.slice(start, start + limit)
  const hasMore = start + limit < items.length
  const last = data[data.length - 1]
  return { data, page: { nextCursor: hasMore && last ? idOf(last) : null, hasMore, total: items.length } }
}

const asStrings = (value: unknown) => (Array.isArray(value) ? value.map(String) : null)

const asCareers = (value: unknown): Profile['careers'] | null => {
  if (!Array.isArray(value)) return null
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    return [
      {
        company: String(row.company ?? ''),
        role: String(row.role ?? ''),
        startedOn: String(row.startedOn ?? ''),
        endedOn: row.endedOn == null || row.endedOn === '' ? null : String(row.endedOn),
        description: String(row.description ?? ''),
      },
    ]
  })
}

const handleCommunity = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'POST' && tail === '/uploads/images') {
    return json(200, { data: { key: `img-${Date.now()}`, url: '/api/v1/uploads/images/mock.png' } })
  }
  if (method === 'POST' && tail === '/sources') {
    const form = await readForm(input, init)
    const file = form?.get('file')
    const named = typeof File !== 'undefined' && file instanceof File
    const source: Source = {
      id: `src-up-${uploadedSources.length + 1}`,
      fileName: named ? file.name : '이력서.pdf',
      mimeType: named && file.type ? file.type : 'application/pdf',
      size: named ? file.size : 1024,
      sha256: 'upload',
      status: 'READY',
      createdAt: new Date().toISOString(),
    }
    uploadedSources.unshift(source)
    return json(200, { data: source })
  }
  const sourceMatch = tail.match(/^\/sources\/([^/]+)$/)
  if (sourceMatch && method === 'GET') {
    const found = allSources().find((item) => item.id === sourceMatch[1])
    return found ? json(200, { data: found }) : json(404, { error: { code: 'NOT_FOUND', message: '서류를 찾지 못했어요' } })
  }
  if (method === 'GET' && tail === '/profiles') {
    const categories = splitParam(url, 'category')
    const items = hubProfiles
      .filter((item) => categories.length === 0 || (item.jobCategory !== null && categories.includes(item.jobCategory)))
      .map(withFlags)
    return json(200, slicePage(url, items, (item) => item.userId))
  }
  const offerCreate = tail.match(/^\/profiles\/([^/]+)\/offer$/)
  if (offerCreate && method === 'POST') {
    const id = offerCreate[1] ?? ''
    const payload = await readJson(input, init)
    const created: Offer = {
      id: `offer-${Date.now()}`,
      sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null, companyName: null, headline: meProfile.headline },
      recipient: { id, displayName: profileById(id).displayName, avatarUrl: null, companyName: null, headline: profileById(id).headline },
      message: String(payload.message ?? ''),
      posting: null,
      status: 'SENT',
      readAt: null,
      createdAt: new Date().toISOString(),
    }
    sentOffers = [created, ...sentOffers]
    const flag = socialFlags.get(id) ?? { following: false, offered: false }
    socialFlags.set(id, { ...flag, offered: true })
    return json(200, { data: created })
  }
  const followMatch = tail.match(/^\/users\/([^/]+)\/follow$/)
  if (followMatch && (method === 'POST' || method === 'DELETE')) {
    const id = followMatch[1] ?? ''
    const flag = socialFlags.get(id) ?? { following: false, offered: false }
    socialFlags.set(id, { ...flag, following: method === 'POST' })
    return new Response(null, { status: 204 })
  }
  if (method === 'GET' && tail === '/posts') {
    const category = url.searchParams.get('category')
    const items = feed.filter((item) => !category || item.category === category)
    return json(200, slicePage(url, items, (item) => item.id))
  }
  if (method === 'POST' && tail === '/posts') {
    const payload = await readJson(input, init)
    const keys = asStrings(payload.imageKeys) ?? []
    const created: Post = {
      id: `post-${feed.length + 1}`,
      author: employerPersona()
        ? { id: 'u1', displayName: COMPANY_BRAND, avatarUrl: null, employer: true, companyName: COMPANY_BRAND }
        : { id: 'u1', displayName: '김서준', avatarUrl: null },
      category: (typeof payload.category === 'string' ? payload.category : 'work') as Post['category'],
      title: String(payload.title ?? ''),
      body: String(payload.body ?? ''),
      imageUrls: keys.map((key) => `/api/v1/uploads/images/${key}`),
      commentCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    }
    feed = [created, ...feed]
    return json(200, { data: created })
  }
  const commentsMatch = tail.match(/^\/posts\/([^/]+)\/comments$/)
  if (commentsMatch) {
    const postId = commentsMatch[1] ?? ''
    const postItem = postById(postId)
    if (!postItem) return json(404, { error: { code: 'NOT_FOUND', message: '글을 찾지 못했어요' } })
    if (method === 'GET') {
      const data = commentThreads.get(postId) ?? []
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (method === 'POST') {
      const payload = await readJson(input, init)
      const company = companyMe()
      const author: Comment['author'] =
        employerPersona() && company
          ? { id: 'u1', displayName: COMPANY_BRAND, avatarUrl: null, employer: true, companyName: COMPANY_BRAND }
          : employerPersona()
            ? { id: 'u1', displayName: '새 담당자', avatarUrl: null, employer: true, companyName: null }
            : { id: 'u1', displayName: '김서준', avatarUrl: null }
      const comment: Comment = {
        id: `c-${Date.now()}`,
        author,
        body: String(payload.body ?? ''),
        parentId: typeof payload.parentId === 'string' ? payload.parentId : null,
        createdAt: new Date().toISOString(),
      }
      const list = commentThreads.get(postId) ?? []
      list.push(comment)
      commentThreads.set(postId, list)
      postItem.commentCount += 1
      return json(200, { data: comment })
    }
  }
  const postMatch = tail.match(/^\/posts\/([^/]+)$/)
  if (postMatch && method === 'GET') {
    const postItem = postById(postMatch[1] ?? '')
    return postItem ? json(200, { data: postItem }) : json(404, { error: { code: 'NOT_FOUND', message: '글을 찾지 못했어요' } })
  }
  if (tail === '/me/profile' && method === 'GET') return json(200, { data: meProfile })
  if (tail === '/me/profile' && method === 'PATCH') {
    const payload = await readJson(input, init)
    const careers = asCareers(payload.careers)
    const skills = asStrings(payload.skills)
    meProfile = {
      ...meProfile,
      displayName: typeof payload.displayName === 'string' ? payload.displayName : meProfile.displayName,
      headline: typeof payload.headline === 'string' ? payload.headline : meProfile.headline,
      intro: typeof payload.intro === 'string' ? payload.intro : meProfile.intro,
      careers: careers ?? meProfile.careers,
      skills: skills ?? meProfile.skills,
      updatedAt: new Date().toISOString(),
    }
    return json(200, { data: meProfile })
  }
  if (method === 'GET' && tail === '/me/links') {
    const kind = url.searchParams.get('kind')
    const data = links.filter((item) => !kind || item.kind === kind)
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'POST' && tail === '/me/links') {
    const payload = await readJson(input, init)
    const created: UserLink = {
      id: `l-${links.length + 1}`,
      kind: (typeof payload.kind === 'string' ? payload.kind : 'other') as UserLink['kind'],
      url: String(payload.url ?? ''),
      title: String(payload.title ?? payload.url ?? ''),
      status: null,
      fitCount: 0,
      aiRead: false,
      createdAt: new Date().toISOString(),
    }
    links = [created, ...links]
    return json(200, { data: created })
  }
  if (method === 'GET' && tail === '/me/bookmarks') {
    const signed = signedOf(input, init)
    return json(200, slicePage(url, listings.filter((item) => present(item, signed).bookmarked), (item) => item.id))
  }
  if (method === 'GET' && tail === '/me/follows') {
    const ids = new Set<string>()
    for (const item of hubProfiles) if (withFlags(item).following) ids.add(item.userId)
    for (const [id, flag] of socialFlags) if (flag.following) ids.add(id)
    return json(200, { data: [...ids].map((id) => profileById(id)), page: { nextCursor: null, hasMore: false, total: ids.size } })
  }
  if (method === 'GET' && tail === '/me/posts') {
    const mine = employerPersona()
      ? feed.filter((item) => item.author.employer === true)
      : [...feed.filter((item) => item.author.id === 'u1' && item.author.employer !== true), ...myPosts]
    return json(200, slicePage(url, mine, (item) => item.id))
  }
  if (method === 'GET' && tail === '/applications') {
    return json(200, { data: applications, page: { nextCursor: null, hasMore: false, total: applications.length } })
  }
  if (method === 'GET' && tail === '/calendar/events') {
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''
    const data = calendarEvents.filter((event) => (!from || event.startsAt >= from) && (!to || event.startsAt < to))
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && tail === '/me/offers') {
    const box = employerPersona() ? [] : url.searchParams.get('box') === 'sent' ? sentOffers : receivedOffers
    return json(200, { data: box, page: { nextCursor: null, hasMore: false, total: box.length } })
  }
  const offerMessages = tail.match(/^\/me\/offers\/([^/]+)\/messages$/)
  if (offerMessages) {
    const id = offerMessages[1] ?? ''
    if (!offerById(id)) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    if (method === 'GET') {
      const data = offerThreads.get(id) ?? []
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (method === 'POST') {
      const payload = await readJson(input, init)
      const created: OfferMessage = {
        id: `msg-${Date.now()}`,
        offerId: id,
        sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
        body: String(payload.body ?? ''),
        createdAt: new Date().toISOString(),
      }
      const list = offerThreads.get(id) ?? []
      list.push(created)
      offerThreads.set(id, list)
      return json(200, { data: created })
    }
  }
  const offerAccept = tail.match(/^\/me\/offers\/([^/]+)\/accept$/)
  if (offerAccept && method === 'POST') {
    const found = offerById(offerAccept[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    const payload = await readJson(input, init)
    found.status = 'ACCEPTED'
    if (typeof payload.reply === 'string' && payload.reply.trim()) {
      const list = offerThreads.get(found.id) ?? []
      list.push({
        id: `msg-${Date.now()}`,
        offerId: found.id,
        sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
        body: payload.reply.trim(),
        createdAt: new Date().toISOString(),
      })
      offerThreads.set(found.id, list)
    }
    return json(200, { data: found })
  }
  const offerDecline = tail.match(/^\/me\/offers\/([^/]+)\/decline$/)
  if (offerDecline && method === 'POST') {
    const found = offerById(offerDecline[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    found.status = 'DECLINED'
    return json(200, { data: found })
  }
  const offerDetail = tail.match(/^\/me\/offers\/([^/]+)$/)
  if (offerDetail && method === 'GET') {
    const found = offerById(offerDetail[1] ?? '')
    return found ? json(200, { data: found }) : json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
  }
  if (method === 'POST' && tail === '/me/notifications/read') {
    const payload = await readJson(input, init)
    const now = new Date().toISOString()
    const ids = Array.isArray(payload.ids) ? new Set(payload.ids.map(String)) : null
    setNoticeBox(noticeBox().map((item) => (payload.all === true || ids?.has(item.id) ? { ...item, readAt: item.readAt ?? now } : item)))
    return new Response(null, { status: 204 })
  }
  if (method === 'GET' && tail === '/me/notifications') {
    const box = noticeBox()
    return json(200, { data: box, page: { nextCursor: null, hasMore: false, total: box.length } })
  }
  if (tail === '/me/settings' && method === 'GET') return json(200, { data: settings })
  if (tail === '/me/settings' && method === 'PATCH') {
    const payload = await readJson(input, init)
    settings = { ...settings, ...(payload as Partial<Settings>) }
    return json(200, { data: settings })
  }
  if (tail === '/me/consents' && method === 'GET') return json(200, { data: consent })
  if (tail === '/me/consents' && method === 'PUT') {
    const payload = await readJson(input, init)
    consent = { referenceData: Boolean(payload.referenceData), updatedAt: new Date().toISOString() }
    return json(200, { data: consent })
  }
  if (method === 'POST' && tail === '/companies/verify') {
    const payload = await readJson(input, init)
    const bNo = String(payload.bNo ?? '').replace(/\D/g, '')
    if (bNo === '0000000000' || bNo.length !== 10) {
      return json(422, {
        error: {
          code: 'BUSINESS_NOT_VERIFIED',
          message: '사업자 정보를 확인하지 못했어요',
          details: { reason: 'MISMATCH' },
        },
      })
    }
    if (bNo === '1111111111') {
      return json(409, { error: { code: 'COMPANY_EXISTS', message: '이미 등록된 사업자번호예요' } })
    }
    const verifiedAt = new Date().toISOString()
    const company: Company = {
      id: 'co-1',
      bNo,
      name: String(payload.bNm ?? ''),
      plan: null,
      verifiedAt,
      role: 'ADMIN',
      seats: { used: 0, limit: 0 },
    }
    rememberCompany({ company, members: [adminMember(verifiedAt)], invites: [] })
    return json(201, { data: company })
  }
  if (method === 'GET' && tail === '/companies/me/members') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    return json(200, { data: record.members })
  }
  if (method === 'GET' && tail === '/companies/me/invites') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    return json(200, { data: record.invites })
  }
  if (method === 'POST' && tail === '/companies/me/invites') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    const same = (other: string) => other.toLowerCase() === email.toLowerCase()
    if (record.members.some((member) => same(member.email))) {
      return json(409, { error: { code: 'CONFLICT', message: '이미 담당자예요' } })
    }
    const pending = record.invites.find((item) => same(item.email))
    if (pending) {
      pending.expiresAt = new Date(Date.now() + INVITE_MS).toISOString()
      return json(201, { data: { email } })
    }
    if (record.company.seats.used >= record.company.seats.limit) {
      return json(403, { error: { code: 'SEAT_LIMIT', message: '담당자 수를 넘었어요' } })
    }
    record.invites.push(pendingInvite(email))
    record.company.seats.used += 1
    return json(201, { data: { email } })
  }
  const memberPath = tail.match(/^\/companies\/me\/members\/([^/]+)$/)
  if (memberPath && (method === 'DELETE' || method === 'PATCH')) {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    const userId = decodeURIComponent(memberPath[1] ?? '')
    if (method === 'DELETE') {
      const index = record.members.findIndex((member) => member.userId === userId)
      if (index < 0) return json(404, { error: { code: 'NOT_FOUND', message: '담당자를 찾지 못했어요' } })
      record.members.splice(index, 1)
      record.company.seats.used = Math.max(0, record.company.seats.used - 1)
      return new Response(null, { status: 204 })
    }
    const payload = await readJson(input, init)
    if (payload.role !== 'ADMIN') return json(400, { error: { code: 'INVALID', message: '역할을 확인해 주세요' } })
    const target = record.members.find((member) => member.userId === userId)
    if (!target) return json(404, { error: { code: 'NOT_FOUND', message: '담당자를 찾지 못했어요' } })
    for (const member of record.members) {
      if (member.userId === userId) member.role = 'ADMIN'
      else if (member.role === 'ADMIN') member.role = 'MEMBER'
    }
    const mine = record.members.find((member) => member.userId === currentUserId())
    if (mine) record.company.role = mine.role
    return new Response(null, { status: 204 })
  }
  const acceptPath = tail.match(/^\/companies\/invites\/([^/]+)\/accept$/)
  if (acceptPath && method === 'POST') return new Response(null, { status: 204 })
  if (method === 'GET' && tail === '/companies/me') {
    const company = companyMe()
    return company ? json(200, { data: company }) : json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
  }
  if (method === 'DELETE' && tail === '/me') {
    const kind = mockPersona()
    if (kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra') {
      return json(409, { error: { code: 'ADMIN_TRANSFER_REQUIRED', message: '관리자를 넘겨 주세요' } })
    }
    return new Response(null, { status: 204 })
  }
  return null
}

const handleEmployerPostings = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'GET' && tail === '/companies/me/postings') {
    const signed = signedOf(input, init)
    const items = employerOwnsPostings() ? companyPostings.map((item) => present(item, signed)) : []
    return json(200, pageOf(url, items))
  }
  if (method === 'POST' && tail === '/postings') {
    const payload = await readJson(input, init)
    companyPostingSeq += 1
    const created = companyPosting({
      id: `job-${companyPostingSeq}`,
      title: String(payload.title ?? ''),
      jobCategory: asJobCategory(payload.jobCategory),
      careerMin: careerMinOf(payload.careerMin),
      careerMax: typeof payload.careerMax === 'number' ? payload.careerMax : null,
      location: String(payload.location ?? ''),
      employmentType: asEmploymentType(payload.employmentType),
      deadline: deadlineOf(payload.deadline),
      description: String(payload.description ?? ''),
      requirements: stringList(payload.requirements),
      preferred: stringList(payload.preferred),
      workConditions: recordOf(payload.workConditions),
      skills: stringList(payload.skills),
      createdAt: new Date().toISOString(),
      revision: 1,
      closedAt: null,
      company: '모아페이',
    })
    companyPostings.unshift(created)
    listings.unshift(toCard(created))
    return json(201, { data: created })
  }
  const applicantMatch = tail.match(/^\/postings\/([^/]+)\/applicants\/([^/]+)$/)
  if (applicantMatch && (method === 'GET' || method === 'PATCH')) {
    const postingId = decodeURIComponent(applicantMatch[1] ?? '')
    const applicationId = decodeURIComponent(applicantMatch[2] ?? '')
    const record = (applicantsByPosting.get(postingId) ?? []).find((item) => item.application.id === applicationId)
    if (!record) return json(404, { error: { code: 'NOT_FOUND', message: '지원자를 찾지 못했어요' } })
    if (method === 'PATCH') {
      if (TERMINAL_APPLICANT_STAGES.has(record.application.stage)) {
        return json(409, { error: { code: 'INVALID_TRANSITION', message: '이미 끝난 지원이에요' } })
      }
      const payload = await readJson(input, init)
      const stage = asStage(payload.stage)
      if (stage) record.application.stage = stage
      return json(200, { data: record.application })
    }
    return json(200, { data: { application: record.application, documents: record.documents } })
  }
  const applicantsMatch = tail.match(/^\/postings\/([^/]+)\/applicants$/)
  if (applicantsMatch && method === 'GET') {
    const postingId = decodeURIComponent(applicantsMatch[1] ?? '')
    const stage = url.searchParams.get('stage')
    const records = (applicantsByPosting.get(postingId) ?? []).filter((item) => !stage || item.application.stage === stage)
    const summaries = records.map((item) => ({
      applicationId: item.application.id,
      applicant: { displayName: item.displayName, headline: item.headline },
      stage: item.application.stage,
      appliedAt: item.application.appliedAt ?? item.application.createdAt,
    }))
    return json(200, slicePage(url, summaries, (item) => item.applicationId))
  }
  const closeMatch = tail.match(/^\/postings\/([^/]+)\/close$/)
  if (closeMatch && method === 'POST') {
    const id = decodeURIComponent(closeMatch[1] ?? '')
    const found = companyPostings.find((item) => item.id === id)
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    if (payload.expectedRevision !== found.revision) return revisionConflict(found.revision)
    found.closedAt = new Date().toISOString()
    found.revision += 1
    syncListing(found)
    return json(200, { data: found })
  }
  const patchMatch = tail.match(/^\/postings\/([^/]+)$/)
  if (patchMatch && method === 'PATCH') {
    const id = decodeURIComponent(patchMatch[1] ?? '')
    const found = companyPostings.find((item) => item.id === id)
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    if (payload.expectedRevision !== found.revision) return revisionConflict(found.revision)
    applyPostingPatch(found, payload)
    syncListing(found)
    return json(200, { data: found })
  }
  const detailMatch = tail.match(/^\/postings\/([^/]+)$/)
  if (detailMatch && method === 'GET') {
    const owned = ownedPostingResponse(decodeURIComponent(detailMatch[1] ?? ''))
    if (owned) return owned
  }
  return null
}

type ChatBucket = {
  conversations: Conversation[]
  messages: Map<string, Message[]>
  postingIds: Map<string, string>
}

const chatBuckets = new Map<string, ChatBucket>()
let chatSeq = 0
let messageSeq = 0

const seededChat = (): ChatBucket => {
  const bucket: ChatBucket = { conversations: [], messages: new Map(), postingIds: new Map() }
  if (!companyMe()) return bucket
  for (const seed of CHAT_SEEDS) {
    bucket.conversations.push({
      id: seed.id,
      revision: 1,
      applicationId: null,
      title: seed.title,
      pinned: false,
      createdAt: seed.updatedAt,
      updatedAt: seed.updatedAt,
    })
    bucket.messages.set(
      seed.id,
      seed.messages.map(([role, text], index) => ({
        id: `${seed.id}-m${index + 1}`,
        conversationId: seed.id,
        role,
        text,
        attachments: [],
        operationId: null,
        createdAt: seed.updatedAt,
      })),
    )
    if (seed.postingId) bucket.postingIds.set(seed.id, seed.postingId)
  }
  return bucket
}

const chatBucket = (): ChatBucket => {
  const key = personaKey()
  const existing = chatBuckets.get(key)
  if (existing) return existing
  const created = seededChat()
  chatBuckets.set(key, created)
  return created
}

const chatMessage = (conversationId: string, role: Message['role'], text: string): Message => ({
  id: `m-${++messageSeq}`,
  conversationId,
  role,
  text,
  attachments: [],
  operationId: null,
  createdAt: new Date().toISOString(),
})

const asIntent = (value: unknown): ChatIntent | undefined =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general' ? value : undefined

const planRequired = (requiredPlan: 'PRO' | 'ULTRA', message: string) =>
  json(403, { error: { code: 'PLAN_REQUIRED', message, details: { requiredPlan } } })

const interviewBlocked = (payload: Record<string, unknown>) => {
  const plan = companyMe()?.plan ?? null
  if (plan === 'PRO' || plan === 'ULTRA') return false
  const text = String(payload.text ?? '')
  return payload.intent === 'interview' || text.includes('면접 준비') || text.includes('면접 질문')
}

const fileNameOf = (value: FormDataEntryValue | null) => {
  if (typeof File !== 'undefined' && value instanceof File && value.name) return value.name
  return 'file'
}

const handleEmployerChat = async (method: string, url: URL, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (!tail.startsWith('/conversations')) return null
  const attachment = tail.match(/^\/conversations\/([^/]+)\/attachments$/)
  if (attachment && method === 'POST') {
    if ((companyMe()?.plan ?? null) !== 'ULTRA') return planRequired('ULTRA', 'Ultra에서 외부 PDF를 올릴 수 있어요')
    const form = await readForm(input, init)
    return json(201, { data: { id: 'file-1', fileName: fileNameOf(form?.get('file') ?? null) } })
  }
  const messagesPath = tail.match(/^\/conversations\/([^/]+)\/messages$/)
  if (messagesPath && (method === 'GET' || method === 'POST')) {
    const id = decodeURIComponent(messagesPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (!conversation) return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    const items = bucket.messages.get(id) ?? []
    if (method === 'GET') return json(200, { data: items, page: { nextCursor: null, hasMore: false, total: items.length } })
    const payload = await readJson(input, init)
    if (interviewBlocked(payload)) return planRequired('PRO', 'Pro부터 면접 질문을 만들 수 있어요')
    const text = String(payload.text ?? '')
    const user = chatMessage(id, 'USER', text)
    const reply = bucket.postingIds.has(id) ? DRAFT_REPLY : assistantReply(asIntent(payload.intent), text)
    const assistant = chatMessage(id, 'ASSISTANT', reply)
    const next = [...items, user, assistant]
    bucket.messages.set(id, next)
    conversation.updatedAt = assistant.createdAt
    return json(202, { data: null })
  }
  if (method === 'GET' && tail === '/conversations') {
    const audience = url.searchParams.get('audience')
    const items =
      audience && audience !== 'EMPLOYER'
        ? []
        : [...chatBucket().conversations].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    return json(200, { data: items, page: { nextCursor: null, hasMore: false, total: items.length } })
  }
  if (method === 'POST' && tail === '/conversations') {
    const payload = await readJson(input, init)
    if (payload.audience !== 'EMPLOYER') return json(404, { error: { code: 'NOT_FOUND', message: '대화를 만들지 못했어요' } })
    if (!companyMe()) return json(403, { error: { code: 'BUSINESS_NOT_VERIFIED', message: '사업자 인증이 필요해요' } })
    const now = new Date().toISOString()
    const id = `c-${++chatSeq}`
    const conversation: Conversation = {
      id,
      revision: 1,
      applicationId: typeof payload.applicationId === 'string' ? payload.applicationId : null,
      title: String(payload.title ?? ''),
      pinned: false,
      createdAt: now,
      updatedAt: now,
    }
    const bucket = chatBucket()
    const seeded = typeof payload.postingId === 'string' ? bucket.conversations.find((item) => bucket.postingIds.get(item.id) === payload.postingId) : undefined
    if (seeded) return json(201, { data: seeded })
    bucket.conversations.unshift(conversation)
    bucket.messages.set(id, [])
    if (typeof payload.postingId === 'string') bucket.postingIds.set(id, payload.postingId)
    return json(201, { data: conversation })
  }
  return json(404, { error: { code: 'NOT_FOUND', message: `mock: ${pathname}` } })
}

const creditBalances = new Map<string, number>()

const MONTHLY_MICRO: Record<string, number> = { BASIC: 3000000, PRO: 15000000, ULTRA: 30000000 }

const seededBalance = () => {
  const kind = mockPersona()
  if (kind === 'employer') return 1880000
  if (kind === 'employer-pro') return 5160000
  if (kind === 'employer-ultra') return 25790000
  return 0
}

const asEmployerPlan = (value: unknown): 'BASIC' | 'PRO' | 'ULTRA' | null =>
  value === 'BASIC' || value === 'PRO' || value === 'ULTRA' ? value : null

const seatLimitFor = (plan: 'BASIC' | 'PRO' | 'ULTRA') =>
  plan === 'ULTRA' ? SEAT_LIMIT_ULTRA : plan === 'PRO' ? SEAT_LIMIT_PRO : SEAT_LIMIT_NONE

const localPlansUrl = (key: 'checkout' | 'topup', value: string) =>
  `/employer/plans?${key}=${encodeURIComponent(value)}`

const companyBillingStatus = (): CompanyBillingStatus => {
  const kind = mockPersona()
  const personal = kind === 'personal' || kind === null
  const plan = personal ? null : (companyMe()?.plan ?? null)
  const monthly = plan ? (MONTHLY_MICRO[plan] ?? 0) : 0
  const balance = creditBalances.get(personaKey()) ?? seededBalance()
  return {
    plan,
    audience: personal ? 'PERSONAL' : 'EMPLOYER',
    balanceMicroCredits: balance,
    subscriptionStatus: 'active',
    periodEndsAt: plan ? '2026-11-01T00:00:00.000Z' : null,
    reservedMicroCredits: 0,
    monthlyMicroCredits: monthly,
    spentMicroCredits: Math.max(0, monthly - balance),
  }
}

const billingChangeAllowed = () => {
  const company = companyMe()
  if (company) return company.role === 'ADMIN'
  return employerPersona()
}

const handleBilling = async (method: string, pathname: string, input: RequestInfo | URL, init?: RequestInit) => {
  const tail = routeTail(pathname)
  if (method === 'GET' && tail === '/billing/ledger') {
    return json(200, { data: [], page: { nextCursor: null, hasMore: false, total: 0 } })
  }
  if (method === 'POST' && (tail === '/billing/checkout' || tail === '/billing/topup')) {
    if (!billingChangeAllowed()) {
      return json(403, { error: { code: 'FORBIDDEN', message: '요금제 변경은 관리자만 할 수 있어요' } })
    }
    const payload = await readJson(input, init)
    if (tail === '/billing/checkout') {
      const planId = typeof payload.planId === 'string' ? payload.planId : ''
      const plan = asEmployerPlan(planId)
      const record = companyRecord()
      if (plan && record) {
        const { spentMicroCredits } = companyBillingStatus()
        creditBalances.set(personaKey(), Math.max(0, (MONTHLY_MICRO[plan] ?? 0) - spentMicroCredits))
        record.company.plan = plan
        record.company.seats = { ...record.company.seats, limit: seatLimitFor(plan) }
      }
      return json(200, { data: { url: localPlansUrl('checkout', planId) } })
    }
    const amount = Number(payload.amount ?? 0)
    const nextBalance = (creditBalances.get(personaKey()) ?? seededBalance()) + (Number.isFinite(amount) ? amount * 1000 : 0)
    creditBalances.set(personaKey(), nextBalance)
    return json(200, { data: { url: localPlansUrl('topup', String(payload.amount ?? '')) } })
  }
  if (method === 'GET' && tail === '/billing') return json(200, { data: companyBillingStatus() })
  return null
}

const flagFor = (id: string) => flags.get(id) ?? { bookmarked: false, applied: false }

const setFlag = (id: string, patch: Partial<{ bookmarked: boolean; applied: boolean }>) => {
  flags.set(id, { ...flagFor(id), ...patch })
}

export const mockFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const url = new URL(requestUrl, typeof location === 'undefined' ? 'http://localhost' : location.href)
  const pathname = url.pathname
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()
  const signed = signedOf(input, init)
  await new Promise((resolve) => setTimeout(resolve, 250))
  const billing = await handleBilling(method, pathname, input, init)
  if (billing) return billing
  const employerChat = await handleEmployerChat(method, url, pathname, input, init)
  if (employerChat) return employerChat
  const employerPosting = await handleEmployerPostings(method, url, pathname, input, init)
  if (employerPosting) return employerPosting
  if (method === 'GET' && pathname.endsWith('/postings/locations')) {
    const counts = new Map<string, number>()
    for (const item of listings) counts.set(item.location, (counts.get(item.location) ?? 0) + 1)
    return json(200, { data: [...counts].map(([location, count]) => ({ location, count })) })
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
        company: item?.company ?? LISTINGS[0]!.company,
        title: item?.title ?? LISTINGS[0]!.title,
        stage: 'APPLIED',
        appliedAt: now,
        createdAt: now,
      },
    })
  }
  if (method === 'GET' && /\/postings\/?$/.test(pathname)) return json(200, catalogPage(url, filteredPostings(url, signed)))
  if (method === 'GET' && /\/search\/?$/.test(pathname)) {
    const q = url.searchParams.get('q') ?? ''
    const type = url.searchParams.get('type') ?? 'postings'
    const board = SEARCH_BOARDS[q.trim()]
    if (type === 'people') {
      const data = board
        ? board.peopleIds.map(profileById)
        : searchHangul(hubProfiles, q, (item) => [item.displayName, item.headline]).map((row) => withFlags(row.item))
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.people ?? data.length } })
    }
    if (type === 'posts') {
      const data = searchHangul(feed, q, (item) => [item.title, item.body]).map((row) => row.item)
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.posts ?? data.length } })
    }
    const found = board
      ? board.postingIds.flatMap((id) => listings.filter((item) => item.id === id))
      : q.trim()
        ? searchHangul(listings, q, (item) => [item.company, item.title]).map((row) => row.item)
        : listings
    const data = found.map((item) => present(item, signed))
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: board?.postings ?? data.length } })
  }
  if (method === 'GET' && /\/sources\/?$/.test(pathname)) {
    const kind = url.searchParams.get('kind')
    const data = kind === 'AI' ? [] : allSources().map(libraryItem)
    return json(200, { data, page: { nextCursor: null, hasMore: false } })
  }
  if (method === 'GET' && /\/postings\/[^/]+$/.test(pathname)) {
    const id = decodeURIComponent(pathname.match(/\/postings\/([^/]+)$/)?.[1] ?? '').split(REPEAT_MARK)[0] ?? ''
    const listed = listings.find((item) => item.id === id)
    if (listed) return json(200, { data: detailFor(listed, signed) })
    const owned = ownedPostingResponse(id)
    if (owned) return owned
    return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
  }
  if (method === 'GET' && /\/profiles\/[^/]+$/.test(pathname)) {
    const id = pathname.match(/\/profiles\/([^/]+)$/)?.[1] ?? HUB_PROFILES[0]!.userId
    const app = isWebView() ? APP_PROFILES[id] : undefined
    return json(200, { data: app ? withFlags(app) : profileById(id) })
  }
  if (method === 'POST' && matches(pathname, '/auth/email/signup')) {
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    if (TAKEN_EMAILS.includes(email)) {
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
    if (password.length < 8 || password.includes('wrong') || email === 'bad@push.app') {
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
    const record = companyRecord()
    return json(200, {
      data: {
        id: user?.id ?? 'u1',
        displayName: user?.displayName ?? '김서준',
        locale: user?.locale ?? 'ko',
        createdAt: '2026-10-01T00:00:00.000Z',
        accountType: user?.accountType ?? 'PERSONAL',
        companyId: record?.company.id ?? user?.companyId ?? null,
        companyRole: record?.company.role ?? user?.companyRole ?? null,
        email: user?.accountType === 'EMPLOYER' ? MEMBER_EMAIL : 'seojun.kim@gmail.com',
        provider: user?.accountType === 'EMPLOYER' ? 'email' : 'google',
      },
    })
  }
  if (method === 'POST' && matches(pathname, '/auth/refresh')) {
    return json(200, { data: sessionStore.load() ?? mockSession(persona ?? 'personal') })
  }
  const community = await handleCommunity(method, url, pathname, input, init)
  if (community) return community
  return json(404, { error: { code: 'NOT_FOUND', message: `mock: ${pathname}` } })
}
