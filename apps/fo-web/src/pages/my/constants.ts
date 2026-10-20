export const PERSONAL_MY_TABS = ['프로필', '서류', '내 활동'] as const

export const EMPLOYER_MY_TABS = ['회사', '내 활동'] as const

export const PERSONAL_ACTIVITY_CHIPS = ['지원활동', '캘린더', '북마크', '팔로우', '게시글'] as const

export const EMPLOYER_ACTIVITY_CHIPS = ['북마크', '팔로우', '게시글'] as const

export const MY_TAB_KEY = {
  프로필: 'profile',
  서류: 'documents',
  '내 활동': 'activity',
  회사: 'company',
} as const

export const ACTIVITY_CHIP_KEY = {
  지원활동: 'applications',
  캘린더: 'calendar',
  북마크: 'bookmarks',
  팔로우: 'follows',
  게시글: 'posts',
} as const

export const DOCUMENT_EMPTY = '아직 등록한 서류가 없어요'
export const DOCUMENT_ORIGINAL = '원본'
export const DOCUMENT_UPLOADED = '이력서 파일을 올렸어요'
export const APPLICATION_EMPTY = '아직 지원한 공고가 없어요'
export const CALENDAR_EMPTY = '일정이 없어요'
export const BOOKMARK_EMPTY = '북마크한 공고가 없어요'
export const FOLLOW_EMPTY = '팔로우한 사람이 없어요'
export const POST_EMPTY = '작성한 글이 없어요'
export const COMPANY_UNVERIFIED = '사업자 인증이 필요해요'
export const PLAN_NONE = '없음'
export const PROFILE_SAVED = '프로필을 저장했어요'
