import { tile } from '@push/design-system'

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
export const DOCUMENT_UPLOADED = '이력서 파일을 올렸어요'
export const DOCUMENT_INGEST = { reading: '읽는 중', failed: '읽지 못했어요' } as const
export const APPLICATION_EMPTY = '아직 지원한 공고가 없어요.'
export const CALENDAR_EMPTY = '이날은 일정이 없어요.'
export const BOOKMARK_EMPTY = '북마크한 공고가 없어요.'
export const FOLLOW_EMPTY = '아직 팔로우한 사람이 없어요.'
export const POST_EMPTY = '아직 쓴 글이 없어요.'
export const BOOKMARK_EMPTY_SUB = '공고에서 북마크를 누르면 여기에 모여요.'
export const FOLLOW_EMPTY_SUB = '허브에서 관심 있는 사람을 팔로우해 보세요.'
export const FOLLOW_EMPTY_ACTION = '허브 둘러보기'
export const POST_EMPTY_SUB = '소셜에 첫 글을 올려 보세요.'
export const POST_EMPTY_ACTION = '글쓰기'
export const COMMENTED_EMPTY = '아직 댓글 단 글이 없어요.'
export const FOLLOWING_LABEL = '팔로잉'
export const bookmarkCount = (count: number) => `북마크한 공고 ${count}개`
export const followCount = (count: number) => `팔로우한 사람 ${count}명`

export const APPLY_FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'done', label: '끝남' },
] as const

export const APPLY_HEAD = { posting: '공고', fit: '적합도', stage: '단계' } as const

export const POSTS_VIEWS = [
  { key: 'mine', label: '내가 쓴 글' },
  { key: 'commented', label: '댓글 단 글' },
] as const
export const POSTS_VIEW_LABEL = '보기'

export const EVENT_KINDS = [
  { key: 'INTERVIEW', label: '면접', tone: 'orange' },
  { key: 'DEADLINE', label: '마감', tone: 'red' },
  { key: 'FOLLOW_UP', label: '후속 연락', tone: 'grey' },
  { key: 'COFFEE_CHAT', label: '커피챗', tone: 'green' },
  { key: 'CUSTOM', label: '직접 추가', tone: 'ac' },
] as const

export const CALENDAR_COPY = {
  prev: '이전 달',
  next: '다음 달',
  add: '일정 추가',
  google: { on: 'Google 캘린더 연결됨', off: 'Google 연결 안 됨' },
  dialogTitle: '어떤 일정을 추가할까요?',
  titleLabel: '일정 이름',
  kindLabel: '일정 종류',
  dateLabel: '날짜',
  timeLabel: '시간',
  submit: '일정 추가하기',
  close: '닫기',
  added: '일정을 추가했어요',
  failed: '일정을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.',
  defaultTime: '14:00',
} as const

export const CALENDAR_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const
export const COMPANY_UNVERIFIED = '사업자 인증이 필요해요'
export const PLAN_NONE = '없음'
export const PROFILE_SAVED = '프로필을 저장했어요'
export const DOCUMENT_AI_LABEL = '앱의 에이전트에서 만듦'
export const DROP_TITLE = '파일을 여기에 끌어다 놓으세요'
export const DROP_HINT = 'PDF, DOCX · 20MB까지'
export const LINK_EMPTY = '아직 모아 둔 링크가 없어요.'
export const LINK_FAILED = '링크를 불러오지 못했어요.'
export const LINK_ADD_FAILED = '링크를 추가하지 못했어요. 잠시 후 다시 시도해 주세요.'
export const LINK_NOTE = '에이전트에서 @언급으로 불러오거나, 서류를 고칠 때 근거로 써요.'
export const FIT_NOTE = '적합도는 앱에서 계산한 점수예요. 자세한 항목과 고칠 점은 앱의 에이전트에서 볼 수 있어요.'
export const LINK_KINDS = [
  { key: 'all', label: '전체' },
  { key: 'job', label: '공고' },
  { key: 'github', label: 'GitHub' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'blog', label: '블로그' },
  { key: 'other', label: '기타' },
] as const

export const PERSONAL_MENU = [
  { label: '프로필', to: '/me?tab=profile', icon: 'user' },
  { label: '서류', to: '/me?tab=documents', icon: 'doc' },
  { label: '내 링크', to: '/me?tab=links', icon: 'link' },
] as const

export const PERSONAL_ACTIVITY_MENU = [
  { label: '지원활동', to: '/me?tab=activity&chip=applications', icon: 'brief' },
  { label: '캘린더', to: '/me?tab=activity&chip=calendar', icon: 'calendar' },
  { label: '북마크', to: '/me?tab=activity&chip=bookmarks', icon: 'bookmark' },
  { label: '팔로우', to: '/me?tab=activity&chip=follows', icon: 'people' },
  { label: '게시글', to: '/me?tab=activity&chip=posts', icon: 'chat' },
] as const

export const EMPLOYER_MENU = [
  { label: '회사 정보', to: '/me?tab=company', icon: 'company' },
  { label: '담당자 관리', to: '/employer/members', icon: 'people' },
  { label: '기업 요금제', to: '/employer/plans', icon: 'card' },
] as const

export const COMPANY_LOCKED = '사업자 정보는 바꿀 수 없어요. 상호가 바뀌었다면 고객센터로 알려 주세요.'
export const COMPANY_NO_HUB = '기업 계정에는 허브 프로필이 없어요.'
export const COMPANY_VERIFIED = '확인됨'

export const EMPLOYER_ACTIVITY_MENU = [
  { label: '북마크', to: '/me?tab=activity&chip=bookmarks', icon: 'bookmark' },
  { label: '팔로우', to: '/me?tab=activity&chip=follows', icon: 'people' },
  { label: '게시글', to: '/me?tab=activity&chip=posts', icon: 'chat' },
] as const
export const ACTIVITY_LOAD_ERROR = '목록을 불러오지 못했어요.'
export const listTotal = (envelope: { data: unknown[]; page: { total?: number } }) => envelope.page.total ?? envelope.data.length

export const PUSH_DOCS_TITLE = 'Push 서류'
export const UPLOADS_TITLE = '올린 파일'
export const UPLOADS_GROUP = (count: number) => `${UPLOADS_TITLE} · ${count}개`
export const DOCUMENT_COUNT = (count: number) => `내 서류 ${count}개`
export const DOCUMENT_UPLOAD = '파일 올리기'
export const DOCUMENT_REGISTER = '파일 등록'
export const DOCUMENT_VIEW = '보기'
export const MORE_LABEL = '더 보기'
export const DOCUMENT_UPLOADING = '올리는 중'
export const DOCUMENT_UPLOAD_CANCEL = '올리기 취소'
export const DOCUMENT_UPLOAD_FAILED = '이력서 파일을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'
export const DOCUMENT_TOO_BIG = (size: string) => `20MB까지 올릴 수 있어요 · 이 파일은 ${size}예요`
export const DOCUMENT_LOAD_FAILED = '서류를 불러오지 못했어요.'
export const DOCUMENT_OPEN_FAILED = '서류를 열지 못했어요'
export const POSTING_NOT_FOUND = '공고를 찾지 못했어요'
export const CLOSE_LABEL = '닫기'
export const RETRY_LABEL = '다시 시도'
export const UNDO_LABEL = '되돌리기'
export const CANCEL_LABEL = '취소'
export const SAVE_LABEL = '저장'
export const DELETE_LABEL = '삭제'
export const UNDO_MS = 5600
export const FRESH_MS = 4000
export const PUSH_DOC_MENU = {
  posting: '공고 보기',
  export: 'PDF로 내보내기',
  rename: '이름 바꾸기',
  remove: '삭제하기',
} as const
export const FILE_MENU = { view: '서류 보기', remove: '서류 삭제하기' } as const
export const DOCUMENT_DELETE = {
  title: '이 서류를 삭제할까요?',
  done: '서류를 삭제했어요',
  failed: '서류를 삭제하지 못했어요',
} as const
export const DOCUMENT_RENAME = {
  title: '서류 이름 바꾸기',
  body: '서류 목록과 지원할 때 이 이름으로 보여요.',
  placeholder: '서류 이름을 입력하세요',
  field: '서류 이름',
  clear: '지우기',
  done: '서류 이름을 바꿨어요',
  failed: '서류 이름을 바꾸지 못했어요',
  max: 40,
} as const

export const LINK_ADD = '링크 추가'
export const LINK_ADD_CONFIRM = '추가'
export const LINK_FIELD = '링크'
export const LINK_HINT = '링크를 붙여넣으면 종류를 알아서 골라요.'
export const LINK_ADDED = '링크를 추가했어요'
export const LINK_KIND_EMPTY = '이 종류로 모아 둔 링크가 없어요.'
export const LINK_TILE = {
  job: tile.navy,
  github: tile.github,
  portfolio: tile.violet,
  blog: tile.cyan,
  other: tile.slate,
} as const
export const LINK_MENU = { open: '링크 열기', remove: '삭제하기' } as const
export const LINK_DELETE = {
  done: '링크를 삭제했어요',
  failed: '링크를 삭제하지 못했어요',
} as const

export const CAREER_NOW = '지금'
export const PROFILE_STATS = (counts: { following: number; followers: number; posts: number }) =>
  `${counts.following} 팔로잉 · ${counts.followers} 팔로워 · ${counts.posts} 게시글`
export const PROFILE_SECTIONS = { intro: '소개', careers: '경력', skills: '기술 스택' } as const
export const PROFILE_EDIT_BASIC = '기본 정보 편집'
export const PROFILE_EDIT = '편집'
export const EDIT_PARAM = 'edit'
export const PROFILE_EDIT_TITLE = '프로필 편집'
export const PROFILE_EDIT_SUB = '허브에 이렇게 보여요 · 저장하면 바로 바뀌어요'
export const PROFILE_PHOTO = {
  change: '사진 바꾸기',
  hint: 'JPG, PNG · 정사각형이 좋아요',
  failed: '사진을 올리지 못했어요',
} as const
export const PROFILE_FIELDS = {
  name: '이름',
  status: '구직 상태',
  headline: '한 줄 소개',
  job: '직군',
  tenure: '경력',
  intro: '소개',
  careers: '경력',
  skills: '기술 스택',
  unset: '선택 안 함',
} as const
export const PROFILE_LIMITS = { name: 20, headline: 40, intro: 500 } as const
export const PROFILE_SAVE_FAILED = '저장하지 못했어요'
export const PROFILE_LOAD_FAILED = '프로필을 불러오지 못했어요.'
export const SKILL_ADD = '추가'
export const SKILL_PLACEHOLDER = '기술 이름'
export const SKILL_REMOVE = (skill: string) => `${skill} 빼기`
export const CAREER_ADD = '경력 추가'
export const CAREER_EDIT = '경력 편집'
export const CAREER_DONE = '완료'
export const CAREER_FIELDS = {
  company: '회사',
  role: '직무',
  start: '시작',
  end: '종료',
  endHint: '비워 두면 지금 다니는 회사로 보여요',
  description: '한 줄 설명',
} as const
export const TENURE_MAX = 20
export const TENURE_LABEL = (years: number) =>
  years <= 0 ? '신입' : years >= TENURE_MAX ? `${TENURE_MAX}년차 이상` : `${years}년차`
