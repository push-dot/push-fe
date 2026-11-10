import type {
  Application,
  Comment,
  Company,
  CompanyBillingStatus,
  CompanyMember,
  Consent,
  Conversation,
  ConversationTurn,
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
  StreamEvent,
  UserLink,
  WebNotification,
} from '@push/api-client'
import { searchHangul } from '@push/shared'
import { sessionStore } from '../auth/session'
import { isWebView } from '../lib/bridge'
import { SEAT_LIMIT_NONE, SEAT_LIMIT_PRO, SEAT_LIMIT_ULTRA } from '../model/constants'
import { assistantReply, type ChatIntent } from '../model/employer-chat'
import { CHAT_SCRIPTS, CHAT_SEED_ATTACHMENTS, CHAT_TURNS, type ChatScriptName } from './mock-chat-scripts'
import {
  APP_DEADLINE_DAYS,
  APP_POSTING_BODY,
  APP_PROFILES,
  APPLICANT_SEEDS,
  CHAT_SEEDS,
  DRAFT_REPLY,
  APPLICATIONS,
  BLOCK_SEEDS,
  CALENDAR_EVENTS,
  CANT_SEND_REPLY,
  CATALOG_TOTALS,
  COMMENT_THREADS,
  EMPLOYER_NOTICES,
  FEED,
  HUB_PROFILES,
  LISTINGS,
  ME_PROFILE,
  MY_FOLLOWS,
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
  type SeedSource,
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

export const MOCK_SWITCHES = [
  'applicant-move-fail',
  'apply-fail',
  'apply-no-docs',
  'apply-slow',
  'auth-exchange-wait',
  'billing-ledger',
  'blocks-empty',
  'blocks-list',
  'bookmarks-empty',
  'calendar-google-off',
  'chat-approve',
  'chat-draft',
  'chat-limit',
  'chat-member',
  'chat-queue',
  'chat-tool',
  'chat-turns',
  'chat-writing',
  'docs-delete-fail',
  'docs-deleted',
  'docs-empty',
  'docs-uploading',
  'follows-empty',
  'home-latest-error',
  'inbox-archive',
  'inbox-block',
  'inbox-cant-send',
  'inbox-empty',
  'inbox-report',
  'invite-accept-wait',
  'invite-expired',
  'invite-invalid',
  'invite-other-account',
  'links-empty',
  'load-fail',
  'login-code-expired',
  'login-code-limit',
  'login-code-wrong',
  'login-phone-taken',
  'login-social-fail',
  'notif-empty',
  'offer-blocked',
  'payments-disabled',
  'phone-sent',
  'posts-empty',
  'profile-save-fail',
  'pw-reset-expired',
  'role-member',
  'signup-consent',
  'signup-taken-employer',
  'slow',
  'social-error',
  'verify-expired',
] as const

export type MockSwitch = (typeof MOCK_SWITCHES)[number]

let switches = new Set<MockSwitch>()

export const setMockSwitches = (value: string | null | undefined) => {
  const names = (value ?? '').split(',').map((part) => part.trim())
  switches = new Set(MOCK_SWITCHES.filter((name) => names.includes(name)))
}

export const mockSwitch = (name: MockSwitch) => switches.has(name) && !isWebView()

const HOLD_MS = 20_000

const hold = () => new Promise((resolve) => setTimeout(resolve, HOLD_MS))

const failure = (status: number, code: string, message: string, details?: Record<string, unknown>) =>
  json(status, { error: { code, message, ...(details ? { details } : {}) } })

const internalError = () => failure(500, 'INTERNAL', '잠시 후 다시 시도해 주세요')

const companyPersona = (kind: MockPersona | null) => kind === 'employer' || kind === 'employer-pro' || kind === 'employer-ultra'

const memberView = () => companyPersona(persona) && (mockSwitch('role-member') || mockSwitch('chat-member'))

const MEMBER_USER = { id: 'u-member', displayName: '한지호', email: 'jiho.han@moapay.kr' }

export const mockSession = (kind: MockPersona): Session => {
  if (companyPersona(kind) && memberView()) {
    return {
      accessToken: 'mock-access',
      refreshToken: 'mock-refresh',
      expiresIn: 900,
      user: {
        id: MEMBER_USER.id,
        displayName: MEMBER_USER.displayName,
        locale: 'ko',
        accountType: 'EMPLOYER',
        companyId: 'co-1',
        companyRole: 'MEMBER',
      },
    }
  }
  if (companyPersona(kind)) {
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

const flags = new Map(listings.map((item) => [item.id, { bookmarked: item.bookmarked, applied: item.applied }]))

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

type CompanyPosting = PostingDetail &
  Required<Pick<PostingDetail, 'status' | 'applicantCount' | 'newApplicantCount' | 'createdBy' | 'draftSource'>> & {
    revision: number
    closedAt: string | null
  }

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
  status: 'OPEN',
  applicantCount: 0,
  newApplicantCount: 0,
  createdBy: null,
  draftSource: null,
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
    applicantCount: 38,
    newApplicantCount: 6,
    createdBy: { displayName: '이민아' },
    ...POSTING_DRAFT_BODY,
  }),
  companyPosting({
    id: 'job-2',
    title: '결제 플랫폼 시니어 엔지니어',
    careerMin: 7,
    careerMax: 9,
    deadline: '2026-11-20',
    createdAt: '2026-10-19T01:00:00.000Z',
    applicantCount: 14,
    newApplicantCount: 2,
    createdBy: { displayName: '한지호' },
  }),
  companyPosting({
    id: 'job-3',
    title: '정산 데이터 엔지니어',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-18T01:00:00.000Z',
    applicantCount: 21,
  }),
  companyPosting({
    id: 'job-4',
    title: '데이터 엔지니어',
    jobCategory: 'data',
    careerMin: 4,
    careerMax: 6,
    deadline: null,
    createdAt: '2026-10-20T00:00:00.000Z',
    status: 'DRAFT',
    draftSource: 'AGENT',
  }),
  companyPosting({
    id: 'job-5',
    title: 'iOS 개발자',
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-09-30',
    closedAt: '2026-09-30T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    status: 'CLOSED',
    applicantCount: 52,
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
  seed: (typeof APPLICANT_SEEDS)[number]
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
  seed,
})

const isPdf = (title: string) => title.endsWith('.pdf')

const documentKinds = (seed: ApplicantRecord['seed']) => [
  ...(seed.documents.some((item) => !isPdf(item.title)) ? (['PROFILE'] as const) : []),
  ...(seed.documents.some((item) => isPdf(item.title)) ? (['PDF'] as const) : []),
]

const applicantSummary = ({ application, seed }: ApplicantRecord) => ({
  applicationId: application.id,
  applicant: { displayName: seed.displayName, headline: seed.headline, jobCategory: seed.jobCategory, tenureYears: seed.tenureYears, avatarUrl: null },
  stage: application.stage,
  appliedAt: application.appliedAt ?? application.createdAt,
  documentKinds: documentKinds(seed),
  documents: seed.documents.map((item) => ({ title: item.title, pages: item.pages ?? null })),
})

// push-be keeps text documents in documents and attached PDFs in files.
const applicantDetail = ({ application, seed }: ApplicantRecord) => ({
  application,
  documents: seed.documents.filter((item) => !isPdf(item.title)).map((item) => ({ id: item.id, title: item.title.replace(' (프로필)', ''), content: item.content })),
  files: seed.documents
    .filter((item) => isPdf(item.title))
    .map((item) => ({ id: item.id, fileName: item.title, mimeType: 'application/pdf', size: 482_000, pageCount: item.pages ?? null })),
  applicant: {
    displayName: seed.displayName,
    email: seed.profile?.email ?? '',
    headline: seed.profile?.headline ?? '',
    careers: seed.profile?.careers ?? [],
    skills: seed.profile?.skills ?? [],
    hubProfileId: seed.profile?.hubProfileId ?? null,
  },
})

const COUNT_KEY = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  ACCEPTED: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'rejected',
} as const

// job-1 stands for a posting with 38 applicants; the five records are the visible page, so moves shift the totals.
const BOARD_COUNTS = { total: 38, applied: 24, screening: 8, interview: 4, offer: 1, rejected: 1 }

const applicantCounts = (postingId: string) => {
  const records = applicantsByPosting.get(postingId) ?? []
  const counts = postingId === 'job-1' ? { ...BOARD_COUNTS } : { total: records.length, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 }
  for (const { application, seed } of records) {
    const from = COUNT_KEY[seed.stage as keyof typeof COUNT_KEY]
    const to = COUNT_KEY[application.stage as keyof typeof COUNT_KEY]
    if (postingId !== 'job-1' && to) counts[to] += 1
    if (postingId === 'job-1' && from && to && from !== to) {
      counts[from] -= 1
      counts[to] += 1
    }
  }
  return counts
}

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

const socialFlags = new Map<string, { following: boolean; offered: boolean }>(MY_FOLLOWS.map((id) => [id, { following: true, offered: false }]))

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

const seedSources: SeedSource[] = SEED_SOURCES.map((item) => ({ ...item }))

const uploadedSources: SeedSource[] = []

const DELETED_SOURCE_ID = 'src-ai-toss'

const allSources = () =>
  [...uploadedSources, ...seedSources].filter((item) => !(mockSwitch('docs-deleted') && item.id === DELETED_SOURCE_ID))

const removeSource = (id: string) => {
  for (const list of [uploadedSources, seedSources]) {
    const at = list.findIndex((item) => item.id === id)
    if (at >= 0) return list.splice(at, 1).length > 0
  }
  return false
}

const libraryItem = (source: SeedSource) => ({
  ...(source.company ? { company: source.company, postingTitle: source.postingTitle } : {}),
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

type CompanyInvite = { id: string; email: string; expiresAt: string; invitedAt: string; sentAt: number }

type CompanyProfile = {
  legalName: string | null
  representativeName: string | null
  industry: string | null
  website: string | null
  intro: string | null
  logoKey: string | null
  logoUrl: string | null
}

type CompanyRecord = {
  company: Company & CompanyProfile
  members: CompanyMember[]
  invites: CompanyInvite[]
}

const INVITE_MS = 7 * 86_400_000

const pendingInvite = (email: string): CompanyInvite => ({ id: `inv-${++inviteSeq}`, email, ...inviteWindow() })

const inviteWindow = () => ({
  invitedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + INVITE_MS).toISOString(),
  sentAt: Date.now(),
})

const RESEND_COOLDOWN_SEC = 60

const inviteView = ({ sentAt: _sentAt, ...item }: CompanyInvite) => item

const MOAPAY_PROFILE: CompanyProfile = {
  legalName: '모아페이 주식회사',
  representativeName: '박정우',
  industry: '핀테크',
  website: 'moapay.kr',
  intro: '결제와 정산을 직접 만드는 핀테크 회사예요.',
  logoKey: null,
  logoUrl: null,
}

const companyRecords = new Map<string, CompanyRecord>()

let inviteSeq = 0

const personaKey = () => mockPersona() ?? 'default'

const currentUserId = () => sessionStore.load()?.user.id ?? 'u1'

// push-be sends every member's displayName; the boards' admin is 이민아.
const adminMember = (joinedAt: string): CompanyMember => ({
  userId: currentUserId(),
  email: MEMBER_EMAIL,
  displayName: sessionStore.load()?.user.displayName ?? '이민아',
  role: 'ADMIN',
  joinedAt,
})

const COMPANY_BRAND = '모아페이'
const COMPANY_BNO = '2148703921'

const memberSeats = (plan: Company['plan'], verifiedAt: string): CompanyRecord => ({
  company: { id: 'co-1', bNo: COMPANY_BNO, name: COMPANY_BRAND, ...MOAPAY_PROFILE, plan, verifiedAt, role: 'MEMBER', seats: { used: 2, limit: 2 } },
  members: [
    { userId: 'u-admin', email: MEMBER_EMAIL, displayName: '이민아', role: 'ADMIN', joinedAt: verifiedAt },
    { userId: MEMBER_USER.id, email: MEMBER_USER.email, displayName: MEMBER_USER.displayName, role: 'MEMBER', joinedAt: '2026-09-02T00:00:00.000Z' },
    { userId: 'u-sora', email: 'sora.park@moapay.kr', displayName: '박소라', role: 'MEMBER', joinedAt: '2026-11-01T00:00:00.000Z' },
  ],
  invites: [],
})

const seedCompany = (): CompanyRecord | null => {
  const kind = mockPersona()
  const verifiedAt = '2026-09-01T00:00:00.000Z'
  if (memberView()) {
    const plan = kind === 'employer-ultra' ? 'ULTRA' : kind === 'employer' ? 'BASIC' : 'PRO'
    return memberSeats(plan, verifiedAt)
  }
  if (kind === 'employer') {
    return {
      company: {
        id: 'co-1',
        bNo: COMPANY_BNO,
        name: COMPANY_BRAND,
        ...MOAPAY_PROFILE,
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
        ...MOAPAY_PROFILE,
        plan: 'PRO',
        verifiedAt,
        role: 'ADMIN',
        seats: { used: 1, limit: 2 },
      },
      members: [
        adminMember(verifiedAt),
        { userId: 'u-member', email: 'jiho.han@moapay.kr', displayName: '한지호', role: 'MEMBER', joinedAt: '2026-09-02T00:00:00.000Z' },
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
        ...MOAPAY_PROFILE,
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

type Block = { user: Offer['sender']; blockedAt: string }

let blocks: Block[] | null = null

const blockList = () => (blocks ??= mockSwitch('blocks-list') ? BLOCK_SEEDS.map((item) => ({ ...item, user: { ...item.user } })) : [])

const CANT_SEND_OFFER = 'offer-1'

const cantSend = (offerId: string) => mockSwitch('inbox-cant-send') && offerId === CANT_SEND_OFFER

const respondedAt = new Map<string, string>([['offer-4', '2026-10-15T01:00:00.000Z']])

const offerView = (offer: Offer) => {
  const blocked = blockList().some((item) => item.user.id === offer.sender.id || item.user.id === offer.recipient.id)
  return {
    ...offer,
    respondedAt: offer.status === 'SENT' ? null : (respondedAt.get(offer.id) ?? offer.readAt),
    canSend: offer.status === 'ACCEPTED' && !blocked && !cantSend(offer.id),
  }
}

const failedReply = (offerId: string) => ({
  ...CANT_SEND_REPLY,
  offerId,
  sender: { id: 'u1', displayName: meProfile.displayName, avatarUrl: null },
  status: 'FAILED',
})

const adminOnly = () => failure(403, 'FORBIDDEN', '관리자만 할 수 있어요')

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
  if (sourceMatch) {
    const found = allSources().find((item) => item.id === sourceMatch[1])
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '서류를 찾지 못했어요' } })
    if (method === 'GET') return json(200, { data: found })
    if (method === 'DELETE') {
      removeSource(found.id)
      return new Response(null, { status: 204 })
    }
    if (method === 'PATCH') {
      const payload = await readJson(input, init)
      if (typeof payload.fileName === 'string' && payload.fileName.trim()) found.fileName = payload.fileName.trim()
      return json(200, { data: found })
    }
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
  if (method === 'GET' && tail === '/me/commented-posts') {
    const commented = feed.filter((item) => (commentThreads.get(item.id) ?? []).some((comment) => comment.author.id === 'u1'))
    return json(200, slicePage(url, commented, (item) => item.id))
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
  if (method === 'GET' && tail === '/calendar/google') return json(200, { data: { connected: true } })
  if (method === 'POST' && tail === '/calendar/events') {
    const payload = await readJson(input, init)
    const now = new Date().toISOString()
    const created: (typeof calendarEvents)[number] = {
      ...CALENDAR_EVENTS[0]!,
      id: `ev-${calendarEvents.length + 1}`,
      type: (typeof payload.type === 'string' ? payload.type : 'INTERVIEW') as (typeof calendarEvents)[number]['type'],
      title: String(payload.title ?? ''),
      startsAt: String(payload.startsAt ?? now),
      endsAt: String(payload.endsAt ?? payload.startsAt ?? now),
      source: 'PUSH' as (typeof calendarEvents)[number]['source'],
      notes: String(payload.notes ?? ''),
      createdAt: now,
      updatedAt: now,
    }
    calendarEvents.push(created)
    return json(201, { data: created })
  }
  if (method === 'GET' && tail === '/me/offers') {
    const box = url.searchParams.get('box')
    const blocked = new Set(blockList().map((item) => item.user.id))
    const archived = url.searchParams.get('archived') === '1'
    const received = receivedOffers.filter((item) => !blocked.has(item.sender.id))
    const data = employerPersona()
      ? []
      : (box === 'sent' ? sentOffers : received).filter((item) => archived === Boolean(item.archivedAt)).map(offerView)
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'GET' && tail === '/me/blocks') {
    const data = blockList()
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
  }
  if (method === 'POST' && tail === '/me/blocks') {
    const payload = await readJson(input, init)
    const userId = String(payload.userId ?? '')
    const known = [...receivedOffers.map((item) => item.sender), ...sentOffers.map((item) => item.recipient)].find((item) => item.id === userId)
    const profile = hubProfiles.find((item) => item.userId === userId)
    const user = known ?? { id: userId, displayName: profile?.displayName ?? userId, avatarUrl: null, companyName: null, headline: profile?.headline ?? '' }
    if (!blockList().some((item) => item.user.id === userId)) blocks = [{ user, blockedAt: new Date().toISOString() }, ...blockList()]
    return new Response(null, { status: 204 })
  }
  const blockMatch = tail.match(/^\/me\/blocks\/([^/]+)$/)
  if (blockMatch && method === 'DELETE') {
    blocks = blockList().filter((item) => item.user.id !== decodeURIComponent(blockMatch[1] ?? ''))
    return new Response(null, { status: 204 })
  }
  const offerAction = tail.match(/^\/me\/offers\/([^/]+)\/(archive|unarchive|report)$/)
  if (offerAction && method === 'POST') {
    const found = offerById(offerAction[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    if (offerAction[2] === 'report') return new Response(null, { status: 204 })
    found.archivedAt = offerAction[2] === 'archive' ? new Date().toISOString() : null
    return json(200, { data: offerView(found) })
  }
  const offerMessages = tail.match(/^\/me\/offers\/([^/]+)\/messages$/)
  if (offerMessages) {
    const id = offerMessages[1] ?? ''
    if (!offerById(id)) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    if (method === 'GET') {
      const data = [...(offerThreads.get(id) ?? []), ...(cantSend(id) ? [failedReply(id)] : [])]
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
    respondedAt.set(found.id, new Date().toISOString())
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
    return json(200, { data: offerView(found) })
  }
  const offerDecline = tail.match(/^\/me\/offers\/([^/]+)\/decline$/)
  if (offerDecline && method === 'POST') {
    const found = offerById(offerDecline[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    found.status = 'DECLINED'
    respondedAt.set(found.id, new Date().toISOString())
    return json(200, { data: offerView(found) })
  }
  const offerDetail = tail.match(/^\/me\/offers\/([^/]+)$/)
  if (offerDetail && method === 'GET') {
    const found = offerById(offerDetail[1] ?? '')
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '제안을 찾지 못했어요' } })
    return json(200, { data: offerView(found) })
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
    const legalName = String(payload.legalName ?? '').trim()
    const company: CompanyRecord['company'] = {
      id: 'co-1',
      bNo,
      name: String(payload.bNm ?? ''),
      legalName: legalName || null,
      representativeName: null,
      industry: null,
      website: null,
      intro: null,
      logoKey: null,
      logoUrl: null,
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
    return json(200, { data: record.invites.map(inviteView) })
  }
  if (method === 'POST' && tail === '/companies/me/invites') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const payload = await readJson(input, init)
    const email = String(payload.email ?? '')
    const same = (other: string) => other.toLowerCase() === email.toLowerCase()
    if (record.members.some((member) => same(member.email))) {
      return json(409, { error: { code: 'CONFLICT', message: '이미 담당자예요' } })
    }
    const pending = record.invites.find((item) => same(item.email))
    if (pending) {
      Object.assign(pending, inviteWindow())
      return json(201, { data: { email } })
    }
    if (record.company.seats.used >= record.company.seats.limit) {
      return json(403, { error: { code: 'SEAT_LIMIT', message: '담당자 수를 넘었어요' } })
    }
    record.invites.push(pendingInvite(email))
    record.company.seats.used += 1
    return json(201, { data: { email } })
  }
  const invitePath = tail.match(/^\/companies\/me\/invites\/([^/]+)(\/resend)?$/)
  if (invitePath && ((method === 'POST' && invitePath[2]) || (method === 'DELETE' && !invitePath[2]))) {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const invite = record.invites.find((item) => item.id === decodeURIComponent(invitePath[1] ?? ''))
    if (!invite) return failure(404, 'NOT_FOUND', '초대를 찾지 못했어요')
    if (method === 'DELETE') {
      record.invites = record.invites.filter((item) => item !== invite)
      record.company.seats.used = Math.max(0, record.company.seats.used - 1)
      return new Response(null, { status: 204 })
    }
    const wait = RESEND_COOLDOWN_SEC - Math.floor((Date.now() - invite.sentAt) / 1000)
    if (wait > 0) return failure(429, 'RATE_LIMITED', '잠시 후 다시 보내 주세요', { retryAfterSec: wait })
    Object.assign(invite, inviteWindow())
    return json(200, { data: inviteView(invite) })
  }
  const memberPath = tail.match(/^\/companies\/me\/members\/([^/]+)$/)
  if (memberPath && (method === 'DELETE' || method === 'PATCH')) {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
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
  if (method === 'GET' && tail === '/companies/me') {
    const company = companyMe()
    return company ? json(200, { data: company }) : json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
  }
  if (method === 'PATCH' && tail === '/companies/me') {
    const record = companyRecord()
    if (!record) return json(404, { error: { code: 'COMPANY_NOT_FOUND', message: '회사를 찾지 못했어요' } })
    if (record.company.role !== 'ADMIN') return adminOnly()
    const payload = await readJson(input, init)
    const keys = ['legalName', 'representativeName', 'industry', 'website', 'intro', 'logoKey'] as const
    for (const key of keys) {
      const value = payload[key]
      if (key in payload) record.company[key] = typeof value === 'string' && value.trim() ? value.trim() : null
    }
    if ('logoKey' in payload) record.company.logoUrl = record.company.logoKey ? `/api/v1/uploads/images/${record.company.logoKey}` : null
    return json(200, { data: record.company })
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
      status: payload.status === 'DRAFT' ? 'DRAFT' : 'OPEN',
      draftSource: payload.draftSource === 'AGENT' || payload.draftSource === 'MANUAL' ? payload.draftSource : null,
      createdBy: { displayName: '이민아' },
    })
    companyPostings.unshift(created)
    if (created.status === 'OPEN') listings.unshift(toCard(created))
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
    return json(200, { data: applicantDetail(record) })
  }
  const fileMatch = tail.match(/^\/postings\/([^/]+)\/applicants\/([^/]+)\/files\/([^/]+)$/)
  if (fileMatch && method === 'GET') {
    const [, postingId = '', applicationId = '', fileId = ''] = fileMatch.map(decodeURIComponent)
    const record = (applicantsByPosting.get(postingId) ?? []).find((item) => item.application.id === applicationId)
    const file = record ? applicantDetail(record).files.find((item) => item.id === fileId) : undefined
    if (!file) return json(404, { error: { code: 'NOT_FOUND', message: '파일을 찾지 못했어요' } })
    return new Response(new Blob([`%PDF-1.4 mock ${file.fileName}`], { type: file.mimeType }), {
      status: 200,
      headers: { 'content-type': file.mimeType, 'content-disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}` },
    })
  }
  const countsMatch = tail.match(/^\/postings\/([^/]+)\/applicant-counts$/)
  if (countsMatch && method === 'GET') return json(200, { data: applicantCounts(decodeURIComponent(countsMatch[1] ?? '')) })
  const applicantsMatch = tail.match(/^\/postings\/([^/]+)\/applicants$/)
  if (applicantsMatch && method === 'GET') {
    const postingId = decodeURIComponent(applicantsMatch[1] ?? '')
    const stage = url.searchParams.get('stage')
    const records = (applicantsByPosting.get(postingId) ?? []).filter((item) => !stage || item.application.stage === stage)
    return json(200, slicePage(url, records.map(applicantSummary), (item) => item.applicationId))
  }
  const closeMatch = tail.match(/^\/postings\/([^/]+)\/close$/)
  if (closeMatch && method === 'POST') {
    const id = decodeURIComponent(closeMatch[1] ?? '')
    const found = companyPostings.find((item) => item.id === id)
    if (!found) return json(404, { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요' } })
    const payload = await readJson(input, init)
    if (payload.expectedRevision !== found.revision) return revisionConflict(found.revision)
    found.closedAt = new Date().toISOString()
    found.status = 'CLOSED'
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
    if (!found.closedAt && (payload.status === 'DRAFT' || payload.status === 'OPEN')) {
      if (found.status === 'DRAFT' && payload.status === 'OPEN') listings.unshift(toCard(found))
      found.status = payload.status
    }
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
  // Finished jobs, oldest first: push-be stores every streamed job and GET .../turns replays them.
  turns: Map<string, ConversationTurn[]>
}

const chatBuckets = new Map<string, ChatBucket>()
let chatSeq = 0
let messageSeq = 0

const seededChat = (): ChatBucket => {
  const bucket: ChatBucket = { conversations: [], messages: new Map(), postingIds: new Map(), turns: new Map() }
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
        attachments: index === 0 && mockSwitch('chat-turns') ? (CHAT_SEED_ATTACHMENTS[seed.id] ?? []) : [],
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

const SSE_GAP_MS = 250

const LIVE_SCRIPTS: [MockSwitch, ChatScriptName][] = [
  ['chat-approve', 'approve'],
  ['chat-tool', 'tool'],
  ['chat-writing', 'writing'],
  ['chat-queue', 'queue'],
  ['chat-draft', 'draft'],
]

type JobFrame = ConversationTurn['events'][number] | StreamEvent

/**
 * A chat job runs on its own, like a push-be worker: streams only read its frames, so closing one leaves the job
 * running, GET .../turns lists it as RUNNING, and stream/active picks it up again after a seq.
 */
type MockJob = {
  conversationId: string
  jobId: string
  userMessageId: string | null
  frames: JobFrame[]
  ended: boolean
  listeners: Set<() => void>
  cancel: () => void
}

const runningJobs = new Map<string, MockJob>()
const activeJobs = new Set<MockJob>()
let jobSeq = 0

const tokensOf = (events: StreamEvent[]) => events.flatMap((event) => (event.type === 'token' ? [event.text] : [])).join('')

// push-be turn_events joins consecutive token rows and keeps the first seq. Status and done are not replayed.
const storedEvents = (frames: JobFrame[]): ConversationTurn['events'] => {
  const events: ConversationTurn['events'] = []
  for (const event of frames) {
    if (event.type === 'status' || event.type === 'done') continue
    const last = events.at(-1)
    if (event.type === 'token' && last?.type === 'token') {
      events[events.length - 1] = { ...last, text: `${last.text}${event.text}` }
      continue
    }
    events.push(event.type === 'token' ? { ...event } : event)
  }
  return events
}

// push-be checkBackpressure: QUEUED+RETRY count above the plan depth is QUEUE_BUSY. A running conversation is not.
const QUEUE_DEPTH_LIMIT = { FREE: 20, BASIC: 40, PRO: 200, ULTRA: 1000 } as const

const queueBusy = (depth: number, plan: string | null | undefined) => {
  const limit = plan === 'BASIC' || plan === 'PRO' || plan === 'ULTRA' ? QUEUE_DEPTH_LIMIT[plan] : QUEUE_DEPTH_LIMIT.FREE
  return depth > limit
}

export const queueBusyBody = (depth: number, plan: string | null | undefined) =>
  queueBusy(depth, plan)
    ? { code: 'QUEUE_BUSY' as const, message: 'queue is busy', details: { retryAfterSec: 30, ahead: depth } }
    : null

const startJob = (
  conversationId: string,
  events: StreamEvent[],
  stall: boolean,
  userMessageId: string | null,
  onEnd: (job: MockJob, status: 'DONE' | 'CANCELLED') => void,
) => {
  let at = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  const job: MockJob = {
    conversationId,
    jobId: `mock-job-${++jobSeq}`,
    userMessageId,
    frames: [],
    ended: false,
    listeners: new Set(),
    cancel: () => {
      clearTimeout(timer)
      job.frames.push({ type: 'cancelled', seq: job.frames.length + 1 })
      close('CANCELLED')
    },
  }
  const notify = () => job.listeners.forEach((listener) => listener())
  const close = (status: 'DONE' | 'CANCELLED') => {
    clearTimeout(timer)
    job.ended = true
    activeJobs.delete(job)
    if (runningJobs.get(conversationId) === job) runningJobs.delete(conversationId)
    onEnd(job, status)
    notify()
  }
  const tick = () => {
    const event = events[at]
    if (!event) {
      if (!stall) close('DONE')
      return
    }
    at += 1
    job.frames.push({ ...event, seq: job.frames.length + 1 })
    // push-be stores the messages and the job before it sends done, so a refetch right after done sees them.
    if (event.type === 'done') {
      close('DONE')
      return
    }
    notify()
    timer = setTimeout(tick, SSE_GAP_MS)
  }
  activeJobs.add(job)
  runningJobs.set(conversationId, job)
  tick()
  return job
}

/** The frames of a job after `after`, then each new one, until it ends; closing the stream leaves the job alone. */
const jobStream = (job: MockJob, after = 0) => {
  const encoder = new TextEncoder()
  let sent = after
  let listener: (() => void) | undefined
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      listener = () => {
        for (const frame of job.frames.slice(sent)) controller.enqueue(encoder.encode(`data: ${JSON.stringify(frame)}\n\n`))
        sent = job.frames.length
        if (!job.ended) return
        job.listeners.delete(listener as () => void)
        controller.close()
      }
      job.listeners.add(listener)
      listener()
    },
    cancel() {
      if (listener) job.listeners.delete(listener)
    },
  })
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/event-stream' } })
}

const creditsSpent = () => json(402, { error: { code: 'INSUFFICIENT_CREDITS', message: '이번 달 사용량을 다 썼어요' } })

const fileNameOf = (value: FormDataEntryValue | null) => {
  if (typeof File !== 'undefined' && value instanceof File && value.name) return value.name
  return 'file'
}

/** push-be keeps every job with its frames; a cancelled one writes no reply. */
const rememberJob = (bucket: ChatBucket, conversation: Conversation) => (job: MockJob, status: 'DONE' | 'CANCELLED') => {
  const id = conversation.id
  const text = status === 'DONE' ? tokensOf(job.frames as StreamEvent[]) : ''
  const reply = text ? chatMessage(id, 'ASSISTANT', text) : null
  if (reply) bucket.messages.set(id, [...(bucket.messages.get(id) ?? []), reply])
  conversation.updatedAt = new Date().toISOString()
  bucket.turns.set(id, [
    ...(bucket.turns.get(id) ?? []),
    {
      jobId: job.jobId,
      status,
      createdAt: conversation.updatedAt,
      userMessageId: job.userMessageId,
      assistantMessageId: reply?.id ?? null,
      answer: null,
      events: storedEvents(job.frames),
    },
  ])
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
    // push-be pages messages newest first; the bucket keeps them oldest first.
    if (method === 'GET') return json(200, { data: [...items].reverse(), page: { nextCursor: null, hasMore: false, total: items.length } })
    const payload = await readJson(input, init)
    if (mockSwitch('chat-limit')) return creditsSpent()
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
  const streamPath = tail.match(/^\/conversations\/([^/]+)\/messages\/stream(\/active)?$/)
  if (streamPath) {
    const id = decodeURIComponent(streamPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (!conversation) return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    if (streamPath[2]) {
      const job = runningJobs.get(id)
      if (method !== 'GET' || !job) return new Response(null, { status: 204 })
      return jobStream(job, Number(url.searchParams.get('after') ?? 0))
    }
    if (method !== 'POST') return null
    const payload = await readJson(input, init)
    if (mockSwitch('chat-limit')) return creditsSpent()
    if (interviewBlocked(payload)) return planRequired('PRO', 'Pro부터 면접 질문을 만들 수 있어요')
    const busy = queueBusyBody(activeJobs.size, companyMe()?.plan)
    if (busy) return json(429, { error: busy })
    const text = String(payload.text ?? '')
    const question = chatMessage(id, 'USER', text)
    bucket.messages.set(id, [...(bucket.messages.get(id) ?? []), question])
    const live = LIVE_SCRIPTS.find(([name]) => mockSwitch(name))
    const script = live ? CHAT_SCRIPTS[live[1]] : null
    if (script?.title) conversation.title = script.title
    conversation.updatedAt = new Date().toISOString()
    const reply = bucket.postingIds.has(id) ? DRAFT_REPLY : assistantReply(asIntent(payload.intent), text)
    const events: StreamEvent[] = script?.events ?? [
      { type: 'token', text: reply },
      { type: 'done', operation: null },
    ]
    return jobStream(startJob(id, events, script?.stall ?? false, question.id, rememberJob(bucket, conversation)))
  }
  const cancelPath = tail.match(/^\/conversations\/([^/]+)\/stream\/cancel$/)
  if (cancelPath && method === 'POST') {
    const id = decodeURIComponent(cancelPath[1] ?? '')
    if (!chatBucket().conversations.some((item) => item.id === id)) {
      return json(404, { error: { code: 'NOT_FOUND', message: '대화를 찾지 못했어요' } })
    }
    const jobs = [...activeJobs].filter((job) => job.conversationId === id)
    const job = jobs.at(-1)
    if (!job) return json(409, { error: { code: 'CONFLICT', message: 'no active stream' } })
    for (const item of jobs) item.cancel()
    return json(200, { data: { jobId: job.jobId, status: 'CANCELLED' } })
  }
  const approvalPath = tail.match(/^\/conversations\/([^/]+)\/approvals\/([^/]+)$/)
  if (approvalPath && method === 'POST') {
    const payload = await readJson(input, init)
    const optionId = String(payload.optionId ?? '')
    const approved = optionId === 'approve'
    const id = decodeURIComponent(approvalPath[1] ?? '')
    const bucket = chatBucket()
    const conversation = bucket.conversations.find((item) => item.id === id)
    if (conversation) startJob(id, CHAT_SCRIPTS[approved ? 'approved' : 'rejected'].events, false, null, rememberJob(bucket, conversation))
    return json(200, { data: { id: approvalPath[2], status: approved ? 'APPROVED' : 'REJECTED', optionId } })
  }
  const turnsPath = tail.match(/^\/conversations\/([^/]+)\/turns$/)
  if (turnsPath && method === 'GET') {
    const turnsId = decodeURIComponent(turnsPath[1] ?? '')
    const seeded = mockSwitch('chat-turns') ? (CHAT_TURNS[turnsId] ?? []) : []
    // Newest first, as push-be pages them.
    const job = runningJobs.get(turnsId)
    const running: ConversationTurn[] = job
      ? [{ jobId: job.jobId, status: 'RUNNING', createdAt: new Date().toISOString(), userMessageId: job.userMessageId, assistantMessageId: null, answer: null, events: storedEvents(job.frames) }]
      : []
    const data = [...running, ...[...(chatBucket().turns.get(turnsId) ?? [])].reverse(), ...seeded]
    return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
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

const MONTHLY_MICRO: Record<string, number> = { BASIC: 18_000_000, PRO: 90_000_000, ULTRA: 180_000_000 }

const seededBalance = () => {
  const kind = mockPersona()
  if (kind === 'employer') return 11_280_000
  if (kind === 'employer-pro') return 30_960_000
  if (kind === 'employer-ultra') return 154_740_000
  return 0
}

const asEmployerPlan = (value: unknown): 'BASIC' | 'PRO' | 'ULTRA' | null =>
  value === 'BASIC' || value === 'PRO' || value === 'ULTRA' ? value : null

const seatLimitFor = (plan: 'BASIC' | 'PRO' | 'ULTRA') =>
  plan === 'ULTRA' ? SEAT_LIMIT_ULTRA : plan === 'PRO' ? SEAT_LIMIT_PRO : SEAT_LIMIT_NONE

const PACK_MICRO = 9_000_000

const PAYMENT_TAILS = new Set(['/billing/checkout', '/billing/topup', '/billing/iap/verify'])

const MAX_PACKS = 20

// The return push-be gives Stripe (billing.ts returnUrls), with a made-up session id.
const localPlansUrl = (checkout: 'success' | 'credits') => `/employer/plans?checkout=${checkout}&session_id=cs_mock_${Date.now()}`

const companyBillingStatus = (): CompanyBillingStatus => {
  const kind = mockPersona()
  const personal = kind === 'personal' || kind === null
  const plan = personal ? null : (companyMe()?.plan ?? null)
  const monthly = plan ? (MONTHLY_MICRO[plan] ?? 0) : 0
  const balance = mockSwitch('chat-limit') ? 0 : (creditBalances.get(personaKey()) ?? seededBalance())
  return {
    plan,
    audience: personal ? 'PERSONAL' : 'EMPLOYER',
    balanceMicroCredits: balance,
    subscriptionStatus: 'active',
    periodEndsAt: plan ? '2026-11-01T00:00:00.000Z' : null,
    reservedMicroCredits: 0,
    monthlyMicroCredits: monthly,
    spentMicroCredits: Math.max(0, monthly - balance),
    ...(mockSwitch('payments-disabled') ? { paymentsEnabled: false } : {}),
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
      return json(200, { data: { url: localPlansUrl('success') } })
    }
    const packs = payload.packs
    if (typeof packs !== 'number' || !Number.isInteger(packs) || packs < 1 || packs > MAX_PACKS) {
      return failure(400, 'VALIDATION_ERROR', '구매 수량을 확인해 주세요', { field: 'packs' })
    }
    creditBalances.set(personaKey(), (creditBalances.get(personaKey()) ?? seededBalance()) + packs * PACK_MICRO)
    return json(200, { data: { url: localPlansUrl('credits') } })
  }
  if (method === 'GET' && tail === '/billing') return json(200, { data: companyBillingStatus() })
  return null
}

const PHONE_CODE_TTL_S = 180

const phoneSent = (cooldownSeconds: number, ttlSeconds = PHONE_CODE_TTL_S) =>
  json(202, { data: { cooldownSeconds, expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString() } })

const handlePhone = (method: string, tail: string) => {
  if (method !== 'POST') return null
  if (tail === '/auth/phone/send') {
    if (mockSwitch('login-code-wrong')) return phoneSent(151)
    if (mockSwitch('login-code-expired')) return phoneSent(0, 0)
    if (mockSwitch('phone-sent')) return phoneSent(168)
    return phoneSent(PHONE_CODE_TTL_S)
  }
  if (tail === '/auth/phone/verify') {
    // push-be sends the code either way and refuses at verify; the board shows this right after send (mock2-requests.md T-auth).
    if (mockSwitch('login-phone-taken')) return failure(409, 'PHONE_ALREADY_REGISTERED', '이미 가입된 번호예요', { existingProviders: ['google'] })
    if (mockSwitch('login-code-wrong')) return failure(400, 'PHONE_CODE_INVALID', '인증번호가 맞지 않아요', { attemptsLeft: 4 })
    if (mockSwitch('login-code-expired')) return failure(400, 'PHONE_CODE_EXPIRED', '인증번호가 만료됐어요')
    if (mockSwitch('login-code-limit')) {
      return failure(429, 'RATE_LIMITED', '인증번호를 5번 잘못 입력했어요', { reason: 'TOO_MANY_ATTEMPTS', maxAttempts: 5 })
    }
    return json(200, { data: { ...mockSession('personal'), created: mockSwitch('signup-consent') } })
  }
  return null
}

const OAUTH_CODE = 'mock-code'

const callbackUrl = (accountType: string | null) => {
  const query = new URLSearchParams({ code: OAUTH_CODE, state: 'mock-state' })
  if (switches.size > 0) query.set('ms', [...switches].join(','))
  if (accountType === 'EMPLOYER') query.set('accountType', 'EMPLOYER')
  return `/auth/callback?mock&${query.toString()}`
}

const handleOAuth = async (method: string, tail: string, url: URL) => {
  if (method === 'GET' && /^\/auth\/[a-z]+\/start$/.test(tail)) {
    if (mockSwitch('login-social-fail')) return failure(502, 'OAUTH_FAILED', 'Google 로그인에 실패했어요')
    return json(200, { data: { authorizationUrl: callbackUrl(url.searchParams.get('accountType')), state: 'mock-state' } })
  }
  if (method === 'POST' && tail === '/auth/exchange') {
    if (mockSwitch('login-social-fail')) return failure(401, 'OAUTH_FAILED', 'Google 로그인에 실패했어요')
    if (mockSwitch('auth-exchange-wait')) await hold()
    const employer = new URLSearchParams(typeof location === 'undefined' ? '' : location.search).get('accountType') === 'EMPLOYER'
    return json(200, { data: mockSession(persona ?? (employer ? 'employer' : 'personal')) })
  }
  return null
}

const INVITE = {
  companyName: COMPANY_BRAND,
  inviterName: '이민아',
  inviterRole: 'ADMIN',
  email: 'jiho.han@moapay.kr',
  expiresAt: '2026-11-08T00:00:00.000Z',
}

const inviteFailure = (token: string) => {
  if (mockSwitch('invite-invalid') || token === 'bad-token') return failure(404, 'NOT_FOUND', '초대 링크를 열 수 없어요', { reason: 'INVALID' })
  if (mockSwitch('invite-expired') || token === 'expired-token') {
    return failure(404, 'NOT_FOUND', '초대가 만료됐어요', { reason: 'EXPIRED', companyName: INVITE.companyName })
  }
  return null
}

const handleInvite = async (method: string, tail: string) => {
  const match = tail.match(/^\/companies\/invites\/([^/]+)(\/accept)?$/)
  if (!match) return null
  const token = decodeURIComponent(match[1] ?? '')
  const failed = inviteFailure(token)
  if (failed) return failed
  if (method === 'GET' && !match[2]) return json(200, { data: INVITE })
  if (method !== 'POST' || !match[2]) return null
  if (mockSwitch('invite-other-account')) return failure(403, 'FORBIDDEN', '초대받은 이메일로만 들어올 수 있어요', { reason: 'EMAIL_MISMATCH' })
  if (mockSwitch('invite-accept-wait')) await hold()
  return new Response(null, { status: 204 })
}

const tokenExpired = (email: string) => failure(410, 'TOKEN_EXPIRED', '링크가 만료됐어요', { email })

const emptyPage = () => json(200, { data: [], page: { nextCursor: null, hasMore: false, total: 0 } })

const EMPTY_LISTS: [MockSwitch, string][] = [
  ['bookmarks-empty', '/me/bookmarks'],
  ['follows-empty', '/me/follows'],
  ['posts-empty', '/me/posts'],
  ['links-empty', '/me/links'],
  ['notif-empty', '/me/notifications'],
  ['inbox-empty', '/me/offers'],
  ['blocks-empty', '/me/blocks'],
  ['docs-empty', '/sources'],
  ['apply-no-docs', '/sources'],
]

const LEDGER = [
  ['2026-10-01', 'PRO', 100],
  ['2026-09-01', 'PRO', 100],
  ['2026-08-01', 'PRO', 100],
  ['2026-07-01', 'BASIC', 20],
] as const

const PLAN_NAMES = { BASIC: 'Basic', PRO: 'Pro', ULTRA: 'Ultra' } as const

// Newest first like push-be; balanceAfter is the running company total, so it is filled from the oldest row up.
const ledgerEntries = () => {
  const rows = LEDGER.flatMap(([day, plan, amountUsd]) => {
    const createdAt = `${day}T00:00:00.000Z`
    return [
      {
        id: `ledger-${day}-payment`,
        type: 'PURCHASE',
        createdAt,
        amountMicroCredits: 0,
        balanceAfter: 0,
        referenceId: `cs_mock_${day}`,
        description: `${PLAN_NAMES[plan]} 월 구독`,
        amountUsd,
        receiptUrl: `https://pay.stripe.com/receipts/mock-${day}`,
      },
      {
        id: `ledger-${day}-grant`,
        type: 'PURCHASE',
        createdAt,
        amountMicroCredits: MONTHLY_MICRO[plan] ?? 0,
        balanceAfter: 0,
        referenceId: `monthly:${day.slice(0, 7)}:${plan}`,
        description: null,
        amountUsd: null,
        receiptUrl: null,
      },
    ]
  })
  let total = 0
  for (const row of [...rows].reverse()) {
    total += row.amountMicroCredits
    row.balanceAfter = total
  }
  return rows
}

const switchResponse = async (method: string, tail: string, url: URL, input: RequestInfo | URL, init?: RequestInit) => {
  if (switches.size === 0 || isWebView()) return null
  if (method === 'GET') {
    const empty = EMPTY_LISTS.find(([name, path]) => mockSwitch(name) && tail === path)
    if (empty) return emptyPage()
    if (mockSwitch('load-fail') && /^\/postings\/(?!locations$)[^/]+$/.test(tail)) return internalError()
    if (mockSwitch('home-latest-error') && tail === '/postings' && url.searchParams.get('sort') === 'latest' && !url.searchParams.has('limit')) {
      return internalError()
    }
    if (mockSwitch('social-error') && tail === '/posts') return internalError()
    if (mockSwitch('slow') && (tail === '/postings' || tail === '/me/bookmarks' || tail === '/applications')) await hold()
    if (mockSwitch('billing-ledger') && tail === '/billing/ledger') {
      const data = ledgerEntries()
      return json(200, { data, page: { nextCursor: null, hasMore: false, total: data.length } })
    }
    if (mockSwitch('calendar-google-off') && tail === '/calendar/google') return json(200, { data: { connected: false } })
  }
  if (method === 'POST') {
    if (/^\/postings\/[^/]+\/apply$/.test(tail)) {
      if (mockSwitch('apply-fail')) return internalError()
      if (mockSwitch('apply-slow')) await hold()
    }
    if (mockSwitch('offer-blocked') && /^\/profiles\/[^/]+\/offer$/.test(tail)) {
      return failure(403, 'BLOCKED', '지금은 이 사람에게 제안을 보낼 수 없어요')
    }
    if (mockSwitch('docs-uploading') && tail === '/sources') await hold()
    // push-be answers this before any role or body check while PAYMENTS_ENABLED is off.
    if (mockSwitch('payments-disabled') && PAYMENT_TAILS.has(tail)) return failure(503, 'PAYMENTS_DISABLED', '지금은 결제할 수 없어요')
    if (mockSwitch('inbox-cant-send') && /^\/me\/offers\/[^/]+\/messages$/.test(tail)) {
      return failure(403, 'OFFER_CLOSED', '이 대화에는 더 이상 메시지를 보낼 수 없어요')
    }
    if (mockSwitch('signup-taken-employer') && tail === '/auth/email/signup') {
      const payload = await readJson(input, init)
      if (payload.email === MEMBER_EMAIL) return failure(409, 'EMAIL_TAKEN', 'taken', { accountType: 'EMPLOYER' })
    }
    if (mockSwitch('verify-expired') && tail === '/auth/email/verify') return tokenExpired(MEMBER_EMAIL)
    if (mockSwitch('pw-reset-expired') && tail === '/auth/email/password-reset/confirm') return tokenExpired(MEMBER_EMAIL)
  }
  if (method === 'PATCH' || method === 'PUT') {
    if (mockSwitch('profile-save-fail') && tail === '/me/profile') return internalError()
    if (mockSwitch('applicant-move-fail') && /^\/postings\/[^/]+\/applicants\/[^/]+$/.test(tail)) return internalError()
  }
  if (method === 'DELETE' && mockSwitch('docs-delete-fail') && /^\/sources\/[^/]+$/.test(tail)) return internalError()
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
  const tail = routeTail(pathname)
  const switched = (await switchResponse(method, tail, url, input, init)) ?? handlePhone(method, tail)
  if (switched) return switched
  const auth = (await handleOAuth(method, tail, url)) ?? (await handleInvite(method, tail))
  if (auth) return auth
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
    const profile = app ? withFlags(app) : profileById(id)
    return json(200, { data: mockSwitch('offer-blocked') ? { ...profile, blockedMe: true } : profile })
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
        email: user?.id === MEMBER_USER.id ? MEMBER_USER.email : user?.accountType === 'EMPLOYER' ? MEMBER_EMAIL : 'seojun.kim@gmail.com',
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
