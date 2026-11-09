import type { Settings } from '@push/api-client'

import type { ThemeChoice } from '../../shared/lib/theme'

export const CONSENT_COPY = '내 서류와 평가 결과를 가공해 다른 사용자와 기업의 AI가 참고 자료로 써요'

export const DELETE_RETENTION =
  '30일 안에 다시 로그인하면 계정이 복구되고, 30일이 지나면 이력서·서류·글·댓글이 모두 삭제돼요. 삭제된 뒤에는 되돌릴 수 없어요.'

export const DELETE_SUBSCRIPTION = '구독은 탈퇴해도 자동으로 해지되지 않아요. App Store나 Google Play에서 직접 해지해 주세요.'

export const DELETE_FAILED = '탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.'

type NotifyKey = 'notifyDeadline' | 'notifyOffer' | 'notifyComment' | 'notifyApplicationStage'

export const NOTIFY_ROWS: { key: NotifyKey; label: string; sub: string; personal: boolean }[] = [
  { key: 'notifyDeadline', label: '마감 임박 공고', sub: '북마크한 공고 마감 3일 전', personal: false },
  { key: 'notifyOffer', label: '제안 받음', sub: '', personal: true },
  { key: 'notifyComment', label: '댓글과 답글', sub: '', personal: false },
  { key: 'notifyApplicationStage', label: '지원 상태 변경', sub: '기업이 내 지원 단계를 바꿨을 때', personal: true },
]

export const SETTINGS_CHANNEL_NOTE = '웹에서는 알림함에 쌓여요. 푸시 알림은 앱에서 받아요.'
export const LOCALE_NOTE = '화면과 에이전트 답변 언어가 함께 바뀌어요'
export const HIDE_COMPANY_LABEL = '현재 회사 사람에게 숨기기'
export const SETTINGS_LOAD_ERROR = '설정을 불러오지 못했어요.'

export const LOGIN_LABEL: Record<string, string> = {
  google: 'Google 계정으로 로그인',
  apple: 'Apple 계정으로 로그인',
  github: 'GitHub 계정으로 로그인',
  phone: '전화번호로 로그인',
  email: '이메일로 로그인',
}

export const CAREER_VISIBILITY: { key: Settings['careerStatusVisibility']; label: string }[] = [
  { key: 'everyone', label: '모두에게' },
  { key: 'followers', label: '팔로워에게만' },
  { key: 'private', label: '나만 보기' },
]

export const CONTACT_VISIBILITY: { key: Settings['contactVisibility']; label: string }[] = [
  { key: 'everyone', label: '모두에게' },
  { key: 'followers', label: '팔로워에게만' },
  { key: 'accepted', label: '제안 수락한 사람만' },
  { key: 'private', label: '나만 보기' },
]

export const LOCALES: { key: Settings['locale']; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
]

export const THEME_LABEL: Record<ThemeChoice, string> = { light: '라이트', dark: '다크', system: '시스템' }

export const SETTINGS_GROUPS = { notify: '알림', general: '일반', hub: '허브 공개' } as const

export const SETTINGS_LABELS = {
  title: '설정',
  locale: '언어',
  theme: '테마',
  profilePublic: '프로필 공개',
  career: '커리어 상태 공개 범위',
  contact: '연락처 공개 범위',
  support: '고객센터',
  terms: '약관 및 정책',
  logout: '로그아웃',
  withdraw: '회원 탈퇴',
} as const

export const SUPPORT_MAIL = 'mailto:support@push.devcyjoon.tech'

export const LOGOUT_TITLE = '로그아웃할까요?'
export const WITHDRAW_TITLE = '회원 탈퇴할까요?'
export const WITHDRAW_CONFIRM = '탈퇴'

export const ADMIN_TRANSFER = {
  title: '관리자를 먼저 넘겨 주세요',
  body: '관리자는 바로 탈퇴할 수 없어요. 담당자 관리에서 다른 담당자에게 관리자를 넘긴 뒤 탈퇴해 주세요.',
  close: '닫기',
  action: '담당자 관리로 가기',
} as const

export const BLOCKED_COPY = {
  title: '차단한 사람',
  back: '설정',
  intro: '차단한 사람은 나에게 제안이나 메시지를 보낼 수 없어요.',
  note: '차단을 풀면 이 사람이 보낸 지난 제안이 받은 제안 목록에 다시 보여요. 차단하거나 풀어도 상대에게는 알리지 않아요.',
  empty: '차단한 사람이 없어요.',
  unblock: '차단 해제',
  failed: '차단을 풀지 못했어요. 잠시 후 다시 시도해 주세요.',
  loadFailed: '차단한 사람을 불러오지 못했어요.',
} as const
