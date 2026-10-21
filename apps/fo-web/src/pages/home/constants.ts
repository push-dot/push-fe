export const HOME_SHORTCUTS = [
  { key: 'jobs', label: '채용공고', hint: '조건으로 골라 보기', to: '/jobs', login: false },
  { key: 'bookmarks', label: '북마크', hint: '저장한 공고', to: '/me?tab=activity&chip=bookmarks', login: true },
  { key: 'activity', label: '내 활동', hint: '진행 중인 지원', to: '/me?tab=activity&chip=applications', login: true },
] as const

export const HOME_SECTIONS = [
  { sort: 'latest', title: '새로 올라온 공고' },
  { sort: 'deadline', title: '마감 임박 공고' },
  { sort: 'popular', title: '이번 주 많이 본 공고' },
] as const

export const OPEN_APPLICATION_STAGES = ['DISCOVERED', 'PREPARING', 'READY', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER'] as const
