import type {
  Application,
  CalendarEvent,
  Comment,
  JobCategory,
  Offer,
  OfferMessage,
  Post,
  Posting,
  PostingDetail,
  Profile,
  Source,
  UserLink,
  WebNotification,
} from '@push/api-client'

export type PostingView = PostingDetail & { industry?: string; preferred?: string[] }

const listing = (item: Partial<Posting> & Pick<Posting, 'id' | 'company' | 'title' | 'location' | 'createdAt'>): Posting => ({
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMin: 4,
  careerMax: 6,
  employmentType: 'full_time',
  deadline: null,
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  ...item,
})

export const LISTINGS: Posting[] = [
  listing({
    id: 'p1',
    company: '모아페이',
    title: '백엔드 엔지니어 (Kotlin·Spring)',
    location: '서울 강남구',
    skills: ['Kotlin', 'Spring Boot', 'JPA', 'Kafka'],
    deadline: '2026-11-03',
    bookmarked: true,
    sourceUrl: 'https://careers.moapay.kr/jobs/1182',
    createdAt: '2026-10-20T12:00:00Z',
  }),
  listing({
    id: 'p2',
    company: '파도AI',
    title: '데이터 분석가',
    jobCategory: 'data',
    location: '서울 서초구',
    skills: ['SQL', 'Python'],
    careerMin: 0,
    careerMax: null,
    deadline: '2026-11-12',
    createdAt: '2026-10-20T11:00:00Z',
  }),
  listing({
    id: 'p3',
    company: '도토리증권',
    title: '서버 개발자 (Go)',
    location: '서울 영등포구',
    skills: ['Go', 'gRPC'],
    deadline: '2026-11-10',
    createdAt: '2026-10-20T10:00:00Z',
  }),
  listing({
    id: 'p9',
    company: '누리클라우드',
    title: '백엔드 개발자',
    location: '성남 판교',
    skills: ['Java', 'Spring Boot', 'MySQL'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-03',
    sourceUrl: 'https://career.nuricloud.kr/jobs/208',
    createdAt: '2026-10-20T09:00:00Z',
  }),
  listing({
    id: 'p5',
    company: '그린티켓',
    title: '그로스 마케터',
    jobCategory: 'marketing',
    location: '서울 중구',
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-14',
    createdAt: '2026-10-20T08:00:00Z',
  }),
  listing({
    id: 'p6',
    company: '새벽마켓',
    title: 'ML 엔지니어',
    location: '서울 송파구',
    skills: ['PyTorch', 'Python'],
    careerMin: 7,
    careerMax: 9,
    deadline: '2026-10-23',
    createdAt: '2026-10-20T07:00:00Z',
  }),
  listing({
    id: 'p7',
    company: '라온헬스',
    title: '안드로이드 개발자',
    location: '서울 강남구',
    skills: ['Kotlin', 'Android'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-10-24',
    bookmarked: true,
    createdAt: '2026-10-20T06:00:00Z',
  }),
  listing({
    id: 'p8',
    company: '별빛게임즈',
    title: 'DevOps 엔지니어',
    location: '성남 판교',
    skills: ['Kubernetes', 'AWS'],
    deadline: '2026-10-25',
    createdAt: '2026-10-20T05:00:00Z',
  }),
  listing({
    id: 'p10',
    company: '하루랩스',
    title: 'iOS 개발자',
    location: '원격',
    skills: ['Swift', 'SwiftUI'],
    deadline: '2026-10-26',
    createdAt: '2026-10-20T04:00:00Z',
  }),
  listing({
    id: 'p11',
    company: '온새미로',
    title: '프로덕트 디자이너',
    jobCategory: 'design',
    location: '서울 마포구',
    skills: ['Figma'],
    deadline: '2026-10-27',
    createdAt: '2026-10-20T03:00:00Z',
  }),
  listing({
    id: 'p12',
    company: '바름로지스',
    title: '물류 데이터 엔지니어',
    jobCategory: 'data',
    location: '경기 이천',
    skills: ['Kafka', 'Python', 'AWS'],
    deadline: '2026-11-08',
    createdAt: '2026-10-20T02:00:00Z',
  }),
  listing({
    id: 'p13',
    company: '솔빛에너지',
    title: '프론트엔드 개발자',
    location: '서울 성동구',
    skills: ['React', 'TypeScript'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-11',
    createdAt: '2026-10-20T01:00:00Z',
  }),
  listing({
    id: 'p14',
    company: '라온헬스',
    title: '백엔드 개발자 (Java)',
    location: '서울 강남구',
    skills: ['Java', 'JPA', 'AWS'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-25',
    bookmarked: true,
    createdAt: '2026-10-15T01:00:00Z',
  }),
  listing({
    id: 'p15',
    company: '그린티켓',
    title: '플랫폼 엔지니어',
    location: '서울 중구',
    skills: ['Node.js', 'TypeScript'],
    careerMin: 1,
    careerMax: 3,
    deadline: '2026-11-28',
    bookmarked: true,
    createdAt: '2026-10-14T01:00:00Z',
  }),
]

export const POPULAR_ORDER = ['p12', 'p13', 'p1', 'p9', 'p3']

export const CATALOG_COUNTS: Record<JobCategory, number> = {
  dev: 198,
  data: 114,
  design: 64,
  marketing: 52,
  plan: 47,
  sales: 38,
  hr: 21,
  ops: 29,
}

const SEARCH_ALIASES: Record<string, string[]> = { p3: ['백엔드'], p12: ['백엔드'] }

export const searchKeys = (item: Posting) => [item.company, item.title, ...(SEARCH_ALIASES[item.id] ?? [])]

export const SEARCH_TOTALS: Record<string, { postings: number; people: number; posts: number }> = {
  백엔드: { postings: 48, people: 12, posts: 31 },
}

const JOB_BODY: Partial<PostingView> = {
  description: [
    '결제 승인·정산 API를 설계하고 운영해요',
    '하루 2,000만 건 거래를 안정적으로 처리하는 구조를 만들어요',
    '장애 대응과 모니터링 체계를 함께 개선해요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java로 서버를 3년 이상 개발해 본 분', 'Spring Boot, JPA 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['Kafka 등 메시지 큐 운영 경험', '결제·금융 도메인 경험'],
}

export const POSTING_DETAILS: Record<string, Partial<PostingView>> = {
  p1: {
    ...JOB_BODY,
    industry: '핀테크',
    workConditions: { 근무지: '서울 강남구 테헤란로 152', '근무 형태': '주 3일 출근 · 유연 근무' },
  },
  p9: {
    ...JOB_BODY,
    industry: '클라우드',
    workConditions: { 근무지: '성남 판교 테헤란로 152', '근무 형태': '주 3일 출근 · 유연 근무' },
  },
}

const career = (company: string, role: string, startedOn: string, endedOn: string | null, description: string) => ({
  company,
  role,
  startedOn,
  endedOn,
  description,
})

const TAEYOON_CAREERS = [
  career('모아페이', '백엔드 엔지니어', '2022-03-01', null, '결제 승인 API 성능 개선, 정산 파이프라인 재설계'),
  career('누리클라우드', '서버 개발자', '2021-01-01', '2022-02-28', '멀티 테넌트 과금 시스템 개발'),
]

export const TAEYOON_INTRO =
  '결제 승인과 정산을 5년 동안 만들어 왔어요. 하루 2,000만 건을 처리하는 승인 API의 p99를 420ms에서 180ms로 줄였고, 정산 배치를 Kafka 기반 스트림으로 바꿨어요. 다음에는 더 큰 트래픽을 다루는 팀에서 일하고 싶어요.'

export const TAEYOON_SKILLS = ['Kotlin', 'Spring Boot', 'JPA', 'Kafka', 'MySQL', 'Redis', 'AWS', 'Kubernetes']

const person = (
  userId: string,
  displayName: string,
  headline: string,
  jobCategory: JobCategory,
  tenureYears: number,
  careerStatus: Profile['careerStatus'],
  patch: Partial<Profile> = {},
): Profile => ({
  userId,
  displayName,
  avatarUrl: null,
  headline,
  jobCategory,
  tenureYears,
  careerStatus,
  openToOffers: careerStatus === 'seeking',
  intro: headline,
  careers: [],
  skills: [],
  followerCount: 40,
  resumeSourceId: null,
  updatedAt: '2026-10-17T09:00:00.000Z',
  ...patch,
})

export const HUB_PROFILES: Profile[] = [
  person('u-taeyoon', '김태윤', '결제 시스템을 만드는 백엔드 개발자', 'dev', 5, 'seeking', {
    intro: TAEYOON_INTRO,
    careers: TAEYOON_CAREERS,
    skills: TAEYOON_SKILLS,
    followerCount: 128,
    followingCount: 42,
    postCount: 15,
  }),
  person('u-haeun', '이하은', 'React로 사용자 경험을 다듬어요. 디자인 시스템을 0부터 만들어 봤어요.', 'dev', 4, 'feedback', {
    intro: '커머스와 SaaS 제품에서 프론트엔드를 맡아 왔어요. 디자인 시스템을 만들고, 느린 화면을 빠르게 바꾸는 일을 좋아해요.',
    careers: [
      career('누리클라우드', '프론트엔드 개발자', '2023-03-01', null, '관리자 콘솔을 Next.js로 옮기고 디자인 시스템을 만들었어요.'),
      career('하루랩스', '웹 개발자', '2021-07-01', '2023-02-28', ''),
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Zustand', 'Storybook'],
    followerCount: 96,
    followingCount: 30,
    postCount: 9,
  }),
  person('u-jiwoo', '최지우', '데이터 파이프라인 · Spark · Airflow. 정산 데이터를 다뤄요.', 'data', 4, 'satisfied'),
  person('u-minjae', '정민재', '쿠버네티스 운영과 비용 줄이기에 관심이 많아요.', 'dev', 5, 'seeking'),
  person('u-sua', '한수아', '결제 경험을 설계하는 프로덕트 디자이너', 'design', 3, 'satisfied'),
  person('u-doyun', '박도윤', '주말엔 사이드 프로젝트, 평일엔 iOS 앱을 만들어요.', 'dev', 3, 'seeking'),
  person('u-yerin', '오예린', '그로스 실험 40개를 돌려 본 마케터', 'marketing', 4, 'feedback'),
  person('u-junho', '서준호', '핀테크 PM. 결제 전환율을 12% 올렸어요.', 'plan', 6, 'satisfied'),
  person('u-chaewon', '윤채원', 'ML 모델을 서빙하는 엔지니어', 'data', 5, 'seeking'),
]

export const SEARCH_PEOPLE_ALIASES: Record<string, string[]> = { 'u-doyun': ['백엔드'] }

export const ME_PROFILE: Profile = {
  userId: 'u1',
  displayName: '김서준',
  avatarUrl: null,
  headline: '결제 시스템을 만드는 백엔드 개발자',
  jobCategory: 'dev',
  tenureYears: 5,
  careerStatus: 'seeking',
  openToOffers: true,
  intro: TAEYOON_INTRO,
  careers: TAEYOON_CAREERS,
  skills: TAEYOON_SKILLS,
  followerCount: 12,
  followingCount: 18,
  postCount: 8,
  resumeSourceId: 'src-resume',
  updatedAt: '2026-10-18T09:00:00.000Z',
}

const placeholder = (hue: number) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400"><rect width="640" height="400" fill="hsl(${hue} 60% 92%)"/></svg>`,
  )}`

const DESIGN_SYSTEM_BODY =
  '토큰부터 정하고 컴포넌트는 나중에. 처음 3주 동안 버튼부터 만들었다가 색이 세 번 바뀌면서 전부 다시 만들었어요. 그 뒤로는 색·글자·간격 토큰을 먼저 합의하고, 화면 세 개를 토큰만으로 그려 본 다음에 컴포넌트를 뽑았어요.'

export const EMPLOYER_POST: Post = {
  id: 'post-emp',
  author: { id: 'u-emp', displayName: '모아페이', avatarUrl: null, employer: true, companyName: '모아페이' },
  category: 'career',
  title: '결제 플랫폼팀이 일하는 방식을 소개해요',
  body: '주 3일 출근, 장애 회고는 이름 없이. 백엔드 엔지니어를 찾고 있어요. 궁금한 점은 댓글로 남겨 주세요.',
  imageUrls: [],
  commentCount: 3,
  viewCount: 41,
  createdAt: '2026-10-21T00:59:30.000Z',
}

export const DESIGN_SYSTEM_POST: Post = {
  id: 'post-1',
  author: { id: 'u-haeun', displayName: '이하은', avatarUrl: null },
  category: 'dev',
  title: '디자인 시스템을 0부터 만들면서 배운 것',
  body: DESIGN_SYSTEM_BODY,
  imageUrls: [placeholder(250), placeholder(160)],
  commentCount: 18,
  viewCount: 1200,
  createdAt: '2026-10-20T23:00:00.000Z',
}

export const FEED: Post[] = [
  EMPLOYER_POST,
  DESIGN_SYSTEM_POST,
  {
    id: 'post-2',
    author: { id: 'u-yerin', displayName: '오예린', avatarUrl: null },
    category: 'career',
    title: '4년차 마케터 이직 준비 후기',
    body: '포트폴리오를 숫자 위주로 바꿨더니 서류 통과율이 확 올랐어요.',
    imageUrls: [],
    commentCount: 31,
    viewCount: 2400,
    createdAt: '2026-10-20T20:00:00.000Z',
  },
  {
    id: 'post-3',
    author: { id: 'u-minjae', displayName: '정민재', avatarUrl: null },
    category: 'coffeechat',
    title: '쿠버네티스 비용 줄이기 커피챗 하실 분',
    body: '판교 근처에서 30분 정도 이야기 나눠요.',
    imageUrls: [],
    commentCount: 6,
    viewCount: 380,
    createdAt: '2026-10-20T00:00:00.000Z',
  },
]

export const COMMENT_THREADS: [string, Comment[]][] = [
  [
    'post-1',
    [
      {
        id: 'c1',
        author: { id: 'u-taeyoon', displayName: '김태윤', avatarUrl: null },
        body: '토큰 먼저 정하는 거 정말 공감해요. 저희도 같은 실수를 했어요.',
        parentId: null,
        createdAt: '2026-10-21T00:00:00.000Z',
      },
      {
        id: 'c2',
        author: { id: 'u-haeun', displayName: '이하은', avatarUrl: null },
        body: '맞아요! 다음 글에서 토큰 이름 정한 방법도 써 볼게요.',
        parentId: 'c1',
        createdAt: '2026-10-21T00:10:00.000Z',
      },
      {
        id: 'c3',
        author: { id: 'u-emp', displayName: '모아페이', avatarUrl: null, employer: true, companyName: '모아페이' },
        body: '좋은 글 감사해요. 저희 팀도 디자인 시스템을 만들고 있어요.',
        parentId: null,
        createdAt: '2026-10-21T00:30:00.000Z',
      },
    ],
  ],
  [
    'post-emp',
    [
      {
        id: 'c4',
        author: { id: 'u1', displayName: '김서준', avatarUrl: null },
        body: '응원해요',
        parentId: null,
        createdAt: '2026-10-20T03:00:00.000Z',
      },
    ],
  ],
]

const party = (id: string, displayName: string, companyName: string | null, headline: string) => ({
  id,
  displayName,
  avatarUrl: null,
  companyName,
  headline,
})

const ME_PARTY = party('u1', '김서준', null, '')

export const RECEIVED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    sender: party('u-jihyun', '오지현', '모아페이', '결제 플랫폼팀 채용 담당'),
    recipient: ME_PARTY,
    message: '안녕하세요, 서준 님! 결제 승인 API 개선 경험을 인상 깊게 봤어요. 결제 플랫폼팀 시니어 포지션으로 30분 커피챗 어떠세요?',
    posting: { id: 'p16', company: '모아페이', title: '결제 플랫폼 시니어 엔지니어', imageUrl: null },
    status: 'ACCEPTED',
    readAt: '2026-10-20T23:10:00.000Z',
    createdAt: '2026-10-20T23:00:00.000Z',
  },
  {
    id: 'offer-3',
    sender: party('u-doyun', '박도윤', '하루랩스', 'iOS 개발자'),
    recipient: ME_PARTY,
    message: '주말 사이드 프로젝트를 같이 하실 백엔드 개발자를…',
    posting: null,
    status: 'SENT',
    readAt: null,
    createdAt: '2026-10-20T00:00:00.000Z',
  },
  {
    id: 'offer-4',
    sender: party('u-jiwoo', '최지우', '파도AI', '데이터 엔지니어'),
    recipient: ME_PARTY,
    message: '정산 데이터 파이프라인 경험을 듣고 싶어요.',
    posting: null,
    status: 'DECLINED',
    readAt: '2026-10-14T03:00:00.000Z',
    createdAt: '2026-10-14T01:00:00.000Z',
  },
  {
    id: 'offer-5',
    sender: party('u-junho', '서준호', '바름로지스', 'PM'),
    recipient: ME_PARTY,
    message: '물류 정산 서비스를 함께 기획할 분을 찾고 있어요.',
    posting: null,
    status: 'SENT',
    readAt: null,
    createdAt: '2026-10-19T01:00:00.000Z',
  },
]

const sentOffer = (id: string, recipient: Offer['recipient'], message: string, status: Offer['status'], createdAt: string): Offer => ({
  id,
  sender: ME_PARTY,
  recipient,
  message,
  posting: null,
  status,
  readAt: status === 'SENT' ? null : createdAt,
  createdAt,
})

export const SENT_OFFERS: Offer[] = [
  sentOffer('offer-2', party('u-minjae', '정민재', null, ''), '쿠버네티스 비용 이야기를 나누고 싶어요.', 'READ', '2026-10-19T01:00:00.000Z'),
  sentOffer('offer-6', party('u-sua', '한수아', null, ''), '결제 화면 설계 경험이 궁금해요.', 'SENT', '2026-10-18T01:00:00.000Z'),
  sentOffer('offer-7', party('u-chaewon', '윤채원', null, ''), '모델 서빙 구조를 배우고 싶어요.', 'DECLINED', '2026-10-12T01:00:00.000Z'),
]

const reply = (id: string, offerId: string, sender: OfferMessage['sender'], body: string, createdAt: string): OfferMessage => ({
  id,
  offerId,
  sender,
  body,
  createdAt,
})

const JIHYUN = { id: 'u-jihyun', displayName: '오지현', avatarUrl: null }
const ME = { id: 'u1', displayName: '김서준', avatarUrl: null }

export const OFFER_THREADS: [string, OfferMessage[]][] = [
  [
    'offer-1',
    [
      reply('om-1', 'offer-1', ME, '제안 감사합니다! 다음 주 화요일이나 수요일 오후 괜찮으세요?', '2026-10-21T05:40:00.000Z'),
      reply('om-2', 'offer-1', JIHYUN, '수요일 오후 4시 어떠세요? 강남역 근처로 갈게요.', '2026-10-21T05:52:00.000Z'),
    ],
  ],
]

export const SEED_NOTICES: WebNotification[] = [
  {
    id: 'n-stage',
    type: 'APPLICATION_STAGE',
    title: '지원 상태가 바뀌었어요',
    body: '모아페이 · 백엔드 엔지니어 → 면접',
    target: { kind: 'activity', id: 'applications' },
    readAt: null,
    createdAt: '2026-10-21T00:50:00.000Z',
  },
  {
    id: 'n-offer',
    type: 'OFFER',
    title: '오지현 님이 제안을 보냈어요',
    body: '결제 플랫폼팀 시니어 포지션으로 커피챗…',
    target: { kind: 'offer', id: 'offer-1' },
    readAt: null,
    createdAt: '2026-10-20T23:00:00.000Z',
  },
  {
    id: 'n-comment',
    type: 'COMMENT',
    title: '내 글에 댓글이 달렸어요',
    body: '김태윤 · 토큰 먼저 정하는 거 정말 공감해요',
    target: { kind: 'post', id: 'post-1' },
    readAt: null,
    createdAt: '2026-10-20T22:00:00.000Z',
  },
  {
    id: 'n-deadline',
    type: 'DEADLINE',
    title: '북마크한 공고가 3일 뒤 마감돼요',
    body: '파도AI · 데이터 분석가',
    target: { kind: 'posting', id: 'p2' },
    readAt: '2026-10-20T01:00:00.000Z',
    createdAt: '2026-10-20T00:00:00.000Z',
  },
]

export const EMPLOYER_NOTICES: WebNotification[] = [
  {
    id: 'n-applicant',
    type: 'APPLICATION_STAGE',
    title: '새 지원자가 있어요',
    body: '결제 승인 백엔드 엔지니어 · 박도윤',
    target: { kind: 'activity', id: 'applicants' },
    readAt: null,
    createdAt: '2026-10-21T00:40:00.000Z',
  },
  {
    id: 'n-ai',
    type: 'AI_DONE',
    title: '에이전트 작업이 끝났어요',
    body: '누리클라우드 공고 참고 · 백엔드 대화가 준비됐어요.',
    target: { kind: 'conversation', id: 'c-ref' },
    readAt: null,
    createdAt: '2026-10-20T23:00:00.000Z',
  },
]

const application = (
  id: string,
  jobId: string,
  company: string,
  title: string,
  stage: Application['stage'],
  appliedAt: string,
  fitScore?: number,
): Application => ({ id, revision: 1, jobId, company, title, stage, appliedAt, createdAt: appliedAt, ...(fitScore === undefined ? {} : { fitScore }) })

export const APPLICATIONS: Application[] = [
  application('app-fit', 'p1', '모아페이', '백엔드 엔지니어 (Kotlin·Spring)', 'INTERVIEW', '2026-10-20T01:00:00.000Z', 8.4),
  application('app-doto', 'p3', '도토리증권', '서버 개발자 (Go)', 'SCREENING', '2026-10-16T01:00:00.000Z', 7.1),
  application('app-star', 'p8', '별빛게임즈', 'DevOps 엔지니어', 'APPLIED', '2026-10-09T01:00:00.000Z'),
  application('app-raon', 'p14', '라온헬스', '백엔드 개발자 (Java)', 'ACCEPTED', '2026-09-21T01:00:00.000Z', 7.8),
  application('app-plain', 'p9', '누리클라우드', '백엔드 개발자', 'REJECTED', '2026-09-02T01:00:00.000Z', 6.2),
]

const event = (
  id: string,
  type: CalendarEvent['type'],
  title: string,
  startsAt: string,
  endsAt: string,
  extra: Partial<CalendarEvent> = {},
): CalendarEvent => ({
  id,
  revision: 1,
  applicationId: null,
  type,
  title,
  startsAt,
  endsAt,
  timeZone: 'Asia/Seoul',
  source: 'GOOGLE',
  externalId: null,
  notes: '',
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...extra,
})

export const CALENDAR_EVENTS: CalendarEvent[] = [
  event('ev-1', 'DEADLINE', '파도AI 마감', '2026-10-03T00:00:00.000Z', '2026-10-03T01:00:00.000Z'),
  event('ev-2', 'COFFEE_CHAT', '이하은 커피챗', '2026-10-09T06:00:00.000Z', '2026-10-09T07:00:00.000Z'),
  event('ev-3', 'FOLLOW_UP', '도토리증권 서류 발표', '2026-10-16T00:00:00.000Z', '2026-10-16T01:00:00.000Z', { applicationId: 'app-doto' }),
  event('ev-4', 'DEADLINE', '파도AI 서류 마감', '2026-10-22T00:00:00.000Z', '2026-10-22T01:00:00.000Z'),
  event('ev-5', 'INTERVIEW', '모아페이 1차 면접', '2026-10-23T05:00:00.000Z', '2026-10-23T06:00:00.000Z', {
    applicationId: 'app-fit',
    notes: '화상',
  }),
  event('ev-6', 'FOLLOW_UP', '면접 준비 알림', '2026-10-23T01:00:00.000Z', '2026-10-23T01:30:00.000Z', { applicationId: 'app-fit' }),
  event('ev-7', 'COFFEE_CHAT', '이하은 커피챗', '2026-10-25T06:00:00.000Z', '2026-10-25T07:00:00.000Z'),
  event('ev-8', 'DEADLINE', '그린티켓 마감', '2026-10-30T00:00:00.000Z', '2026-10-30T01:00:00.000Z'),
]

const file = (id: string, fileName: string, mimeType: string, size: number, createdAt: string, extra: Partial<Source> = {}): Source => ({
  id,
  fileName,
  mimeType,
  size,
  sha256: id,
  status: 'READY',
  createdAt,
  ...extra,
})

const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const SEED_SOURCES: Source[] = [
  file('src-ai', '모아페이_맞춤_이력서_v2.pdf', 'application/pdf', 1_900_000, '2026-10-20T01:00:00.000Z', { kind: 'AI_MADE' }),
  file('src-resume', '김서준_백엔드_이력서_2026.pdf', 'application/pdf', 2_400_000, '2026-10-12T01:00:00.000Z'),
  file('src-career', '경력기술서_모아페이.docx', DOCX, 640_000, '2026-09-28T01:00:00.000Z'),
  file('src-extra', '포트폴리오_결제시스템.pdf', 'application/pdf', 8_100_000, '2026-08-03T01:00:00.000Z'),
]

const link = (id: string, kind: UserLink['kind'], title: string, url: string): UserLink => ({
  id,
  kind,
  url: `https://${url}`,
  title,
  status: null,
  fitCount: 0,
  aiRead: false,
  createdAt: '2026-10-10T00:00:00.000Z',
})

export const SEED_LINKS: UserLink[] = [
  link('l1', 'job', '모아페이 · 결제 플랫폼 시니어 엔지니어', 'careers.moapay.kr/jobs/1182'),
  link('l2', 'job', '누리클라우드 · 백엔드 개발자', 'nuricloud.career.greetinghr.com'),
  link('l3', 'job', '그린티켓 · 플랫폼 엔지니어', 'wanted.co.kr/wd/231877'),
  link('l4', 'github', 'seojun-kim', 'github.com/seojun-kim'),
  link('l5', 'github', 'settle-pipeline', 'github.com/seojun-kim/settle-pipeline'),
  link('l6', 'portfolio', '김서준 포트폴리오', 'seojun.notion.site'),
  link('l7', 'blog', '결제 승인 API p99 절반으로 줄이기', 'velog.io/@seojun/p99'),
]

export type ApplicantSeed = {
  id: string
  stage: Application['stage']
  displayName: string
  headline: string
  appliedAt: string
  documents: { id: string; title: string; content: string }[]
}

const PROFILE_DOC = { title: '이력서 (프로필)', content: TAEYOON_INTRO }

export const APPLICANT_SEEDS: ApplicantSeed[] = [
  {
    id: 'app-2',
    stage: 'SCREENING',
    displayName: '김태윤',
    headline: '개발 · 5년 · 모아페이와 같은 결제 도메인',
    appliedAt: '2026-10-20T01:00:00.000Z',
    documents: [
      { id: 'doc-3', ...PROFILE_DOC },
      { id: 'doc-4', title: '포트폴리오.pdf', content: '결제 승인 API와 정산 스트림 사례를 14쪽으로 정리했어요.' },
    ],
  },
  {
    id: 'app-3',
    stage: 'APPLIED',
    displayName: '정민재',
    headline: '개발 · 5년',
    appliedAt: '2026-10-19T01:00:00.000Z',
    documents: [{ id: 'doc-5', title: '이력서.pdf', content: '쿠버네티스 운영과 비용 절감 경험을 정리했어요.' }],
  },
  {
    id: 'app-4',
    stage: 'INTERVIEW',
    displayName: '윤채원',
    headline: '데이터 · 5년',
    appliedAt: '2026-10-18T01:00:00.000Z',
    documents: [{ id: 'doc-6', title: '이력서 (프로필)', content: 'ML 모델을 서빙하는 엔지니어예요.' }],
  },
  {
    id: 'app-1',
    stage: 'APPLIED',
    displayName: '박도윤',
    headline: '개발 · 3년',
    appliedAt: '2026-10-15T01:00:00.000Z',
    documents: [
      { id: 'doc-1', title: '이력서 (프로필)', content: '평일엔 iOS 앱을 만들어요.' },
      { id: 'doc-2', title: '경력기술서.pdf', content: '사이드 프로젝트 두 개를 운영했어요.' },
    ],
  },
  {
    id: 'app-5',
    stage: 'REJECTED',
    displayName: '서준호',
    headline: '개발 · 6년',
    appliedAt: '2026-10-12T01:00:00.000Z',
    documents: [
      { id: 'doc-7', title: '이력서.pdf', content: '핀테크 서버를 6년 만들었어요.' },
      { id: 'doc-8', title: '포트폴리오.pdf', content: '결제 전환율 개선 사례예요.' },
    ],
  },
]

const DRAFT = {
  title: '결제 승인 백엔드 엔지니어 (Kotlin)',
  description: [
    '하루 2,000만 건 결제 승인 API를 설계하고 성능을 개선해요',
    '거래액 증가에 맞춰 확장 가능한 구조로 바꿔요',
    '장애 대응 체계와 모니터링을 함께 만들어요',
  ].join('\n'),
  requirements: ['Kotlin 또는 Java 서버 개발 4년 이상', '대용량 트래픽 API 운영 경험', 'RDBMS 설계와 쿼리 튜닝 경험'],
  preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시지 큐 운영 경험'],
  workConditions: { 근무: '주 3일 출근 · 유연 근무', 근무지: '서울 강남구 테헤란로 152' },
}

export const DRAFT_REPLY = [
  '결제 승인 API를 키울 4–6년차 기준으로 썼어요. 참고 공고의 표현은 옮기지 않고, 모아페이 거래 규모를 넣었어요.',
  '```posting-draft',
  JSON.stringify(DRAFT, null, 2),
  '```',
  '등록하기 전에 공고 편집에서 고칠 수 있어요. 연봉 범위를 넣을까요?',
].join('\n')

export type ChatSeed = {
  id: string
  title: string
  updatedAt: string
  postingId?: string
  messages: ['USER' | 'ASSISTANT', string][]
}

export const CHAT_SEEDS: ChatSeed[] = [
  {
    id: 'c-ref',
    title: '누리클라우드 공고 참고 · 백엔드',
    updatedAt: '2026-10-21T00:59:40.000Z',
    postingId: 'p9',
    messages: [
      ['USER', '이 공고 참고해서 우리 회사 백엔드 공고 만들어 줘'],
      [
        'ASSISTANT',
        [
          '좋아요. 먼저 모아페이를 찾아보고, 참고 공고와 비교해서 필요한 걸 여쭤볼게요.',
          '모아페이는 결제 승인과 정산을 직접 운영하고, 최근 거래액이 빠르게 늘고 있어요. 참고 공고는 1–3년차 대상이라 그대로 쓰면 연차가 맞지 않을 수 있어요.',
          '이번에 가장 필요한 사람은 누구예요?',
          '1. 결제 승인 API를 키울 사람\n2. 정산 파이프라인을 맡을 사람\n3. 둘 다 볼 수 있는 시니어\n4. 직접 말하기',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-review',
    title: '백엔드 지원자 김태윤 서류 검토',
    updatedAt: '2026-10-20T08:00:00.000Z',
    messages: [
      ['USER', '이 지원자 서류 검토해 줘'],
      [
        'ASSISTANT',
        [
          '서류 전체는 공고와 잘 맞아요. 다만 아래 세 곳은 면접에서 직접 확인해 보는 게 좋아요.',
          '확인 필요 · “p99 420ms → 180ms”의 본인 역할\n성과 수치는 구체적인데, 무엇을 직접 바꿨는지 설명이 같은 연차 서류보다 짧아요.',
          '확인 필요 · Kafka 정산 파이프라인\n문장 구조는 고급인데, 처리량·장애 사례 같은 빈칸 내용이 구체적이지 않아요.',
          '근거 충분 · 결제 승인 API 운영 4년\n기간, 트래픽 규모, 장애 회고가 서로 맞아요.',
          '합격·불합격은 담당자가 정해요. AI는 확인할 부분만 짚어요.',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-interview',
    title: '결제 플랫폼 시니어 면접 질문',
    updatedAt: '2026-10-20T07:00:00.000Z',
    messages: [
      ['USER', '면접 질문 만들어 줘'],
      [
        'ASSISTANT',
        [
          '면접관 시점에서 서류의 역량이 사실인지 확인하는 질문 5개예요. 확인 필요였던 부분부터 넣었어요.',
          '1. p99를 180ms로 줄일 때 직접 바꾼 코드나 설정을 하나 골라 설명해 주세요.\n확인할 점 · 팀 성과와 본인 기여를 구분하는지, 측정 방법을 아는지',
          '2. 정산 파이프라인에서 메시지가 중복으로 들어왔을 때 어떻게 막았나요?\n확인할 점 · 멱등성 처리 방식, 실제 장애 사례가 있는지',
          '3. Kafka 컨슈머 지연이 났던 날을 시간순으로 말해 주세요.\n확인할 점 · 모니터링 지표와 대응 순서가 구체적인지',
          '4. 승인 API를 다시 설계한다면 가장 먼저 바꿀 것은 무엇인가요?\n확인할 점 · 지금 구조의 한계를 스스로 아는지',
          '5. 4년 동안 가장 크게 실패한 배포는 무엇이었나요?\n확인할 점 · 회고 습관, 책임 범위',
        ].join('\n\n'),
      ],
    ],
  },
  {
    id: 'c-draft',
    title: '데이터 엔지니어 새 공고',
    updatedAt: '2026-10-20T06:00:00.000Z',
    messages: [
      ['USER', '데이터 엔지니어 공고 초안 써 줘'],
      ['ASSISTANT', '초안을 만들었어요. 공고 편집에서 열어 고쳐 주세요.'],
    ],
  },
]
