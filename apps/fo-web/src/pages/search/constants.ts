export const RECENT_SEARCH_KEY = 'push-recent-searches'
export const RECENT_SEARCH_LIMIT = 8
export const TRENDING_SEARCHES = ['백엔드', '프론트엔드', '모아페이', '디자이너', 'PM', 'iOS', '데이터', '인턴'] as const
export const SEARCH_TABS = [
  { type: 'postings', label: '공고' },
  { type: 'people', label: '사람' },
  { type: 'posts', label: '게시글' },
] as const
export const SEARCH_LOGIN_COPY = '로그인하면 사람과 글을 찾을 수 있어요'
export type SearchType = (typeof SEARCH_TABS)[number]['type']
