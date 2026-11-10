import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchPage from './search-page'

type Query = { isLoading: boolean; isError: boolean; data?: { data: unknown[]; page: { total?: number } }; refetch: () => void }

const state = vi.hoisted(() => ({ postings: {} as Query, people: {} as Query, posts: {} as Query }))

vi.mock('../../features/search-catalog', () => ({
  useSearchPostings: () => state.postings,
  useSearchPeople: () => state.people,
  useSearchPosts: () => state.posts,
}))
vi.mock('../../features/recent-searches', () => ({
  readRecentSearches: () => [],
  saveRecentSearch: () => [],
  removeRecentSearch: () => [],
  clearRecentSearches: () => undefined,
}))
vi.mock('../../shared/auth/use-session', () => ({ useSession: () => ({ accountType: 'PERSONAL' }) }))

const idle = (): Query => ({ isLoading: false, isError: false, refetch: () => undefined })
const empty = (): Query => ({ ...idle(), data: { data: [], page: { total: 0 } } })
const render = (search: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/search${search}`]}>
      <SearchPage />
    </MemoryRouter>,
  )

describe('SearchPage states', () => {
  beforeEach(() => {
    state.postings = empty()
    state.people = empty()
    state.posts = empty()
  })

  it('waits for the people search before the overview says nothing matched', () => {
    state.people = { ...idle(), isLoading: true }
    const html = render('?q=kotlin')
    expect(html).not.toContain('맞는 결과가 없어요')
    expect(html).toContain('aria-busy="true"')
  })

  it('shows an error with 다시 시도 when a search fails, in the overview and on a tab', () => {
    state.postings = { ...idle(), isError: true }
    expect(render('?q=kotlin')).toContain('검색 결과를 불러오지 못했어요')
    state.postings = empty()
    state.people = { ...idle(), isError: true }
    const html = render('?q=kotlin&type=people')
    expect(html).toContain('검색 결과를 불러오지 못했어요')
    expect(html).not.toContain('맞는 결과가 없어요')
  })

  it('keeps the postings that loaded when only the people search fails in the overview', () => {
    state.postings = { ...idle(), data: { data: [{ id: 'j1', title: '백엔드 개발자', company: '모아페이' }], page: { total: 1 } } }
    state.people = { ...idle(), isError: true }
    const html = render('?q=kotlin')
    expect(html).toContain('백엔드 개발자')
    expect(html).toContain('검색 결과를 불러오지 못했어요')
    expect(html).not.toContain('맞는 결과가 없어요')
  })

  it('says nothing matched only after every search answered empty', () => {
    expect(render('?q=kotlin')).toContain('맞는 결과가 없어요')
    expect(render('?q=kotlin&type=posts')).toContain('맞는 결과가 없어요')
  })
})
