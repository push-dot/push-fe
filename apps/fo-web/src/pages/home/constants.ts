export const HOME_SHORTCUTS = [
  { label: '채용공고', to: '/jobs', login: false },
  { label: '북마크', to: '/me?tab=activity&chip=bookmarks', login: true },
  { label: '내 활동', to: '/me?tab=activity&chip=applications', login: true },
] as const

export const HOME_SECTIONS = [
  { sort: 'latest', title: '새로 올라온 공고', description: '최근에 올라온 공고부터 보여드려요' },
  { sort: 'deadline', title: '마감 임박 공고', description: '일주일 안에 마감되는 공고예요' },
  { sort: 'popular', title: '이번 주 많이 본 공고', description: '이번 주 많이 본 공고예요' },
] as const
