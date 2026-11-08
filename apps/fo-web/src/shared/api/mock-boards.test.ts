import { afterEach, describe, expect, it, vi } from 'vitest'
import { dDay } from '../lib/format'
import { mockFetch, setMockPersona } from './mock'

const API = 'http://localhost/api/v1'
const SIGNED = { headers: { Authorization: 'Bearer mock-access' } }

const get = async <T>(path: string, init?: RequestInit) => (await (await mockFetch(`${API}${path}`, init)).json()) as T

const post = (path: string, body: unknown) =>
  mockFetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

type Page<T> = { data: T[]; page: { nextCursor: string | null; hasMore: boolean; total: number } }
type Card = { id: string; company: string }

const walk = async (query: string) => {
  const ids: string[] = []
  let cursor: string | null = null
  let first: Page<Card> | null = null
  for (;;) {
    const page: Page<Card> = await get<Page<Card>>(`/postings?${query}${cursor ? `&cursor=${cursor}` : ''}`)
    first ??= page
    ids.push(...page.data.map((item) => item.id))
    if (!page.page.hasMore) return { first, ids, last: page }
    cursor = page.page.nextCursor
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('detail pages inside the app WebView', () => {
  it('serves the Push 앱 board posting, D-13 from today', async () => {
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
    const { data } = await get<{ data: Record<string, unknown> & { deadline: string } }>('/postings/p1')
    expect(data).toMatchObject({
      company: '모아페이',
      industry: '핀테크',
      title: '백엔드 엔지니어 (Kotlin·Spring)',
      location: '서울 강남구',
      careerMin: 4,
      careerMax: 6,
      description: '결제 승인·취소 API를 설계하고 개발해요\n정산 배치의 성능과 정확도를 높여요',
      requirements: ['Kotlin 또는 Java로 4년 이상 서버 개발', 'Spring Boot, JPA 실무 경험'],
      preferred: ['결제·금융 도메인 경험', 'Kafka 등 메시징 시스템 운영 경험'],
      workConditions: { 근무: '주 5일, 유연 출퇴근 (코어 11–16시)', 보상: '연봉 협의 · 스톡옵션' },
    })
    expect(dDay(data.deadline)).toBe('D-13')
  })

  it('serves 이하은 as u2 and 김서준 as me with the app board values', async () => {
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
    const haeun = await get<{ data: Record<string, unknown> }>('/profiles/u2')
    expect(haeun.data).toMatchObject({
      userId: 'u2',
      displayName: '이하은',
      headline: 'React로 사용자 경험을 다듬어요',
      tenureYears: 4,
      careerStatus: 'seeking',
      followingCount: 42,
      followerCount: 128,
      postCount: 15,
      following: false,
    })
    const me = await get<{ data: Record<string, unknown> & { careers: { company: string; role: string }[] } }>('/profiles/me')
    const auth = await get<{ data: { id: string } }>('/auth/me')
    expect(me.data).toMatchObject({ userId: auth.data.id, displayName: '김서준', tenureYears: 4, followingCount: 18, followerCount: 12, postCount: 8 })
    expect(me.data.intro).toMatch(/^4년 동안 결제·정산 시스템을/)
    expect(me.data.careers.map((item) => `${item.company} · ${item.role}`)).toEqual(['모아페이 · 백엔드 엔지니어', '하루랩스 · 서버 개발자'])
  })

  it('keeps the Push 웹 board values in the browser', async () => {
    const posting = await get<{ data: { workConditions: Record<string, string>; deadline: string } }>('/postings/p1')
    expect(posting.data.workConditions).toEqual({ 근무지: '서울 강남구 테헤란로 152', '근무 형태': '주 3일 출근 · 유연 근무' })
    expect(posting.data.deadline).toBe('2026-11-03')
    const haeun = await get<{ data: { headline: string } }>('/profiles/u-haeun')
    expect(haeun.data.headline).toBe('React로 사용자 경험을 다듬어요. 디자인 시스템을 0부터 만들어 봤어요.')
    const u2 = await get<{ data: { displayName: string } }>('/profiles/u2')
    expect(u2.data.displayName).not.toBe('이하은')
  })
})

describe('signed state per request', () => {
  it('answers overlapping guest and member requests each with its own bookmark state', async () => {
    setMockPersona('personal')
    const [member, guest] = await Promise.all([
      get<{ data: { bookmarked: boolean } }>('/postings/p1', SIGNED),
      get<{ data: { bookmarked: boolean } }>('/postings/p1'),
    ])
    expect(member.data.bookmarked).toBe(true)
    expect(guest.data.bookmarked).toBe(false)
  })
})

describe('search', () => {
  it('returns the WebSearch board rows in the board order', async () => {
    setMockPersona('personal')
    const postings = await get<Page<Card>>('/search?q=백엔드&type=postings')
    expect(postings.data.map((item) => item.company)).toEqual(['모아페이', '누리클라우드', '도토리증권', '바름로지스'])
    expect(postings.page.total).toBe(48)
    const people = await get<Page<{ displayName: string }>>('/search?q=백엔드&type=people', SIGNED)
    expect(people.data.map((item) => item.displayName)).toEqual(['김태윤', '박도윤'])
    expect(people.page.total).toBe(12)
  })
})

describe('posting catalog paging', () => {
  it('pages the 개발 외 1 list through the 312 the board reads', async () => {
    setMockPersona(null)
    const board = await get<Page<Card>>('/postings?category=dev,data&sort=latest&limit=12')
    expect(board.page).toMatchObject({ total: 312, hasMore: true })
    expect(board.data).toHaveLength(12)
    const { ids, last } = await walk('category=dev,data&sort=latest&limit=100')
    expect(ids).toHaveLength(312)
    expect(new Set(ids).size).toBe(312)
    expect(last.page.hasMore).toBe(false)
    const repeated = ids[300]!
    const detail = await get<{ data: { id: string } }>(`/postings/${repeated}`)
    expect(detail.data.id).toBe(repeated.split('~')[0])
  })

  it('reports the real list length everywhere else', async () => {
    for (const query of ['sort=latest&limit=4', 'category=dev,data&careerYears=4-6&sort=latest&limit=4', 'category=design&sort=latest&limit=4']) {
      const { first, ids } = await walk(query)
      expect(first.page.total).toBe(ids.length)
    }
  })
})

describe('employer chat seeds', () => {
  it('reuses the seeded conversation for its reference posting and opens a new one for others', async () => {
    setMockPersona('employer-pro')
    const ref = await (await post('/conversations', { title: '참고', audience: 'EMPLOYER', postingId: 'p9' })).json()
    const again = await (await post('/conversations', { title: '참고', audience: 'EMPLOYER', postingId: 'p9' })).json()
    expect(ref.data.id).toBe('c-ref')
    expect(again.data.id).toBe('c-ref')
    const other = await (await post('/conversations', { title: '참고', audience: 'EMPLOYER', postingId: 'p1' })).json()
    expect(other.data.id).not.toBe('c-ref')
    const list = await get<Page<{ id: string }>>('/conversations?audience=EMPLOYER')
    expect(list.data.map((item) => item.id)).toEqual(expect.arrayContaining(['c-ref', 'c-review', 'c-interview', 'c-draft', other.data.id]))
    expect(list.data).toHaveLength(5)
    const draft = await get<Page<unknown>>('/conversations/c-draft/messages')
    expect(draft.data).toEqual([])
  })
})

describe('notifications', () => {
  it('keeps the employer and personal boxes apart', async () => {
    setMockPersona('personal')
    const personal = await get<Page<{ readAt: string | null }>>('/me/notifications')
    expect(personal.data).toHaveLength(4)
    expect(personal.data.filter((item) => !item.readAt)).toHaveLength(3)
    setMockPersona('employer-pro')
    const employer = await get<Page<{ readAt: string | null }>>('/me/notifications')
    expect(employer.data).toHaveLength(2)
    await post('/me/notifications/read', { all: true })
    expect((await get<Page<{ readAt: string | null }>>('/me/notifications')).data.every((item) => item.readAt)).toBe(true)
    setMockPersona('personal')
    expect((await get<Page<{ readAt: string | null }>>('/me/notifications')).data.filter((item) => !item.readAt)).toHaveLength(3)
  })
})

describe('links', () => {
  it('lists the seven board links, filters by kind and adds one', async () => {
    setMockPersona('personal')
    expect((await get<Page<unknown>>('/me/links')).page.total).toBe(7)
    expect((await get<Page<{ kind: string }>>('/me/links?kind=github')).data.map((item) => item.kind)).toEqual(['github', 'github'])
    expect((await post('/me/links', { kind: 'blog', url: 'velog.io/@seojun/new' })).status).toBeLessThan(300)
    expect((await get<Page<unknown>>('/me/links')).page.total).toBe(8)
  })
})

describe('employer credits and seats', () => {
  it('spends the monthly grant down to the board balances', async () => {
    const spent = async (persona: Parameters<typeof setMockPersona>[0]) => {
      setMockPersona(persona)
      return (await get<{ data: { monthlyMicroCredits: number; spentMicroCredits: number; balanceMicroCredits: number } }>('/billing')).data
    }
    expect(await spent('employer-pro')).toMatchObject({ monthlyMicroCredits: 15_000_000, balanceMicroCredits: 5_160_000, spentMicroCredits: 9_840_000 })
    expect(await spent('employer-ultra')).toMatchObject({ monthlyMicroCredits: 30_000_000, spentMicroCredits: 4_210_000 })
    expect(await spent('personal')).toMatchObject({ monthlyMicroCredits: 0, spentMicroCredits: 0 })
  })

  it('seeds Pro at 1 of 2 seats with contract-shaped members and the brand name', async () => {
    setMockPersona('employer-pro')
    const company = await get<{ data: { name: string; seats: { used: number; limit: number } } }>('/companies/me')
    expect(company.data).toMatchObject({ name: '모아페이', seats: { used: 1, limit: 2 } })
    const members = await get<{ data: Record<string, unknown>[] }>('/companies/me/members')
    expect(members.data).toHaveLength(2)
    expect(members.data.every((item) => Object.keys(item).sort().join() === 'email,joinedAt,role,userId')).toBe(true)
    expect((await post('/companies/me/invites', { email: 'yuna.choi@moapay.kr' })).status).toBe(201)
    expect((await post('/companies/me/invites', { email: 'sora.park@moapay.kr' })).status).toBe(403)
  })
})
