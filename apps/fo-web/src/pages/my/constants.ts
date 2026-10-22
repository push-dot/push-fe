export const PERSONAL_MY_TABS = ['프로필', '서류', '내 활동'] as const

export const EMPLOYER_MY_TABS = ['회사 정보', '내 활동'] as const

export const PERSONAL_ACTIVITY_CHIPS = ['지원활동', '캘린더', '북마크', '팔로우', '게시글'] as const

export const EMPLOYER_ACTIVITY_CHIPS = ['북마크', '팔로우', '게시글'] as const

export const MY_TAB_KEY = {
  프로필: 'profile',
  서류: 'documents',
  '내 활동': 'activity',
  '회사 정보': 'company',
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
export const DOCUMENT_INGEST = { reading: '읽는 중', failed: '읽지 못했어요' } as const
export const APPLICATION_EMPTY = '아직 지원한 공고가 없어요'
export const CALENDAR_EMPTY = '일정이 없어요'
export const BOOKMARK_EMPTY = '북마크한 공고가 없어요'
export const FOLLOW_EMPTY = '팔로우한 사람이 없어요'
export const POST_EMPTY = '작성한 글이 없어요'
export const COMPANY_UNVERIFIED = '사업자 인증이 필요해요'
export const PLAN_NONE = '없음'
export const PROFILE_SAVED = '프로필을 저장했어요'
export const DOCUMENT_AI_LABEL = '앱의 AI 채팅에서 만듦'
export const DROP_TITLE = '파일을 여기에 끌어다 놓으세요'
export const DROP_HINT = 'PDF, DOCX · 20MB까지'
export const LINK_EMPTY = '아직 링크가 없어요'
export const LINK_FAILED = '링크를 불러오지 못했어요.'
export const LINK_ADD_FAILED = '링크를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.'
export const LINK_NOTE = '앱의 AI 채팅에서 @언급으로 불러와 서류를 고칠 때 근거로 써요.'
export const FIT_NOTE = '적합도는 앱에서 계산한 점수예요. 자세한 항목과 고칠 점은 앱의 AI 채팅에서 볼 수 있어요.'
export const LINK_KINDS = [
  { key: 'all', label: '전체' },
  { key: 'job', label: '공고' },
  { key: 'github', label: 'GitHub' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'blog', label: '블로그' },
  { key: 'other', label: '기타' },
] as const

export const PERSONAL_MENU = [
  { label: '프로필', to: '/me?tab=profile' },
  { label: '서류', to: '/me?tab=documents' },
  { label: '내 링크', to: '/me?tab=links' },
] as const

export const PERSONAL_ACTIVITY_MENU = [
  { label: '지원활동', to: '/me?tab=activity&chip=applications' },
  { label: '캘린더', to: '/me?tab=activity&chip=calendar' },
  { label: '북마크', to: '/me?tab=activity&chip=bookmarks' },
  { label: '팔로우', to: '/me?tab=activity&chip=follows' },
  { label: '게시글', to: '/me?tab=activity&chip=posts' },
] as const

export const EMPLOYER_MENU = [
  { label: '회사 정보', to: '/me?tab=company' },
  { label: '담당자 관리', to: '/employer/members' },
  { label: '기업 요금제', to: '/employer/plans' },
] as const

export const COMPANY_LOCKED = '사업자 정보는 바꿀 수 없어요. 상호가 바뀌었다면 고객센터로 알려 주세요.'
export const COMPANY_NO_HUB = '기업 계정에는 허브 프로필이 없어요.'
export const COMPANY_VERIFIED = '확인됨'

export const EMPLOYER_ACTIVITY_MENU = [
  { label: '북마크', to: '/me?tab=activity&chip=bookmarks' },
  { label: '팔로우', to: '/me?tab=activity&chip=follows' },
  { label: '게시글', to: '/me?tab=activity&chip=posts' },
] as const
