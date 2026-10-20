import type { Posting, PostingDetail } from '@push/api-client'
import { mock, page } from './server'

const base = (p: Partial<Posting> & Pick<Posting, 'id' | 'company' | 'title' | 'location' | 'careerMin'>): Posting => ({
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMax: null,
  employmentType: 'full_time',
  deadline: null,
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  createdAt: '2026-10-19T09:00:00Z',
  ...p,
})

// Sample data from the Claude Design boards (홈, 채용공고, 채용공고 상세).
export const postings: Posting[] = [
  base({ id: 'p1', company: '모아페이', title: '백엔드 엔지니어 (Kotlin·Spring) · 결제 플랫폼팀', location: '서울 강남구', careerMin: 4, careerMax: 6, skills: ['Kotlin', 'Spring Boot', 'JPA', 'Kafka'], deadline: '2026-11-02', bookmarked: true, sourceUrl: 'https://careers.moapay.kr/jobs/1182' }),
  base({ id: 'p2', company: '파도AI', title: '데이터 분석가 (추천·검색 랭킹 실험 설계)', jobCategory: 'data', location: '서울 서초구', careerMin: 0, skills: ['SQL', 'Python'], deadline: '2026-10-22' }),
  base({ id: 'p3', company: '도토리증권', title: '서버 개발자 (Go)', location: '서울 영등포구', careerMin: 4, careerMax: 6, skills: ['Go', 'gRPC'], deadline: '2026-10-24' }),
  base({ id: 'p4', company: '누리클라우드', title: '프론트엔드 개발자 (React)', location: '서울 마포구', careerMin: 1, careerMax: 3, skills: ['React', 'TypeScript'], deadline: '2026-11-09' }),
  base({ id: 'p5', company: '그린티켓', title: '그로스 마케터', jobCategory: 'marketing', location: '서울 중구', careerMin: 1, careerMax: 3, deadline: '2026-10-25' }),
  base({ id: 'p6', company: '새벽마켓', title: 'ML 엔지니어', location: '서울 송파구', careerMin: 7, skills: ['PyTorch', 'Python'], deadline: '2026-10-29' }),
  base({ id: 'p7', company: '라온헬스', title: '안드로이드 개발자', location: '서울 강남구', careerMin: 1, careerMax: 3, skills: ['Kotlin', 'Android'], deadline: '2026-10-31' }),
  base({ id: 'p8', company: '별빛게임즈', title: 'DevOps 엔지니어', location: '성남 판교', careerMin: 4, careerMax: 6, skills: ['Kubernetes', 'AWS'], deadline: '2026-11-04', bookmarked: true }),
]

const details: Record<string, Partial<Omit<PostingDetail, keyof Posting>>> = {
  p1: {
    requirements: ['Kotlin 또는 Java로 4년 이상 서버 개발', 'Spring Boot, JPA 실무 경험'],
    workConditions: ['주 5일, 유연 출퇴근 (코어 11–16시)', '연봉 협의 · 스톡옵션'],
  },
}

const days = (iso: string | null) => (iso ? (Date.parse(iso) - Date.now()) / 86_400_000 : Infinity)
const csv = (q: URLSearchParams, k: string) => q.get(k)?.split(',').filter(Boolean) ?? []

mock('GET', 'postings', ({ query }) => {
  let list = postings
  const cats = csv(query, 'category')
  if (cats.length) list = list.filter((p) => cats.includes(p.jobCategory))
  const skills = csv(query, 'skills')
  if (skills.length) list = list.filter((p) => skills.some((s) => p.skills.includes(s)))
  // Home sections reuse the list: ?sort=deadline → 마감 7일 이내 (feature-spec 3.3).
  if (query.get('sort') === 'deadline') list = list.filter((p) => days(p.deadline) <= 7).sort((a, b) => days(a.deadline) - days(b.deadline))
  return page(list, query)
})

mock('GET', 'postings/:id', ({ params }) => {
  const p = postings.find((x) => x.id === params.id)
  if (!p) return { status: 404, body: { error: { code: 'NOT_FOUND', message: '공고를 찾지 못했어요.' } } }
  const detail: PostingDetail = {
    ...p,
    description: '결제 승인·취소 API를 설계하고 개발해요\n정산 배치의 성능과 정확도를 높여요',
    requirements: [],
    workConditions: [],
    ...details[p.id],
  }
  return { data: detail }
})

const setBookmark = (id: string, on: boolean) => {
  const p = postings.find((x) => x.id === id)
  if (p) p.bookmarked = on
}
mock('POST', 'postings/:id/bookmark', ({ params }) => setBookmark(params.id!, true))
mock('DELETE', 'postings/:id/bookmark', ({ params }) => setBookmark(params.id!, false))
mock('GET', 'me/bookmarks', ({ query }) => page(postings.filter((p) => p.bookmarked), query))
mock('POST', 'postings/:id/apply', ({ params }) => {
  const p = postings.find((x) => x.id === params.id)
  if (p) p.applied = true
  return { status: 201, body: { data: { id: `a-${params.id}`, stage: 'APPLIED' } } }
})
