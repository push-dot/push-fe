export const RECENT_SEARCH_KEY = 'push-recent-searches'
export const RECENT_SEARCH_LIMIT = 8
export const TRENDING_SEARCHES = ['Kotlin', '프론트엔드 신입', '데이터 분석', '원격 근무', 'iOS', '토스', 'PM', 'DevOps'] as const
export const TRENDING_TITLE = '지금 많이 찾는 검색어'
export const SEARCH_TABS = [
  { type: 'postings', label: '공고' },
  { type: 'people', label: '사람' },
  { type: 'posts', label: '게시글' },
] as const
export const SEARCH_LOGIN_COPY = '로그인하면 사람과 글을 찾을 수 있어요'
export const SEARCH_EMPTY = '검색 결과가 없어요'
export type SearchType = (typeof SEARCH_TABS)[number]['type']
