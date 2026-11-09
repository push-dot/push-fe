export const TRENDING_SEARCHES = ['Kotlin', '프론트엔드 신입', '데이터 분석', '원격 근무', 'iOS', '토스', 'PM', 'DevOps'] as const
export const TRENDING_TITLE = '지금 많이 찾는 검색어'
export const SEARCH_TABS = [
  { type: 'postings', label: '공고' },
  { type: 'people', label: '사람' },
  { type: 'posts', label: '게시글' },
] as const
export const SEARCH_LOGIN_COPY = '로그인하면 사람과 글을 찾을 수 있어요'
export const searchEmptyTitle = (q: string) => `‘${q}’에 맞는 결과가 없어요.`
export const SEARCH_EMPTY_HINT = '다른 말로 찾아보세요.'
export const SEARCH_CLEAR = '검색어 지우기'
export const SEARCH_PEOPLE_TITLE = '사람'
export const SEARCH_RECENT_TITLE = '최근 검색어'
export const SEARCH_RECENT_CLEAR = '모두 지우기'
export const SEARCH_PREVIEW_POSTINGS = 4
export const SEARCH_PREVIEW_PEOPLE = 2
export const searchAllPostings = (total: number) => `공고 ${total}개 모두 보기`
export type SearchType = (typeof SEARCH_TABS)[number]['type']
