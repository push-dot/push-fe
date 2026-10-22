import type { Settings } from '@push/api-client'

export const CONSENT_COPY = '내 서류와 평가 결과를 가공해 다른 사용자와 기업의 AI가 참고 자료로 써요'

export const DELETE_CONFIRM =
  '유료 구독은 바로 해지돼요. 30일 안에 다시 로그인하면 계정이 복구되고, 30일이 지나면 이력서·서류·글·댓글이 모두 삭제돼요. 삭제된 뒤에는 되돌릴 수 없어요.'

export const DELETE_ADMIN = '다른 담당자에게 관리자를 넘긴 뒤 탈퇴할 수 있어요'

export const DELETE_FAILED = '탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.'

export const NOTIFY_ROWS: {
  key: 'notifyDeadline' | 'notifyOffer' | 'notifyComment' | 'notifyAiDone' | 'notifyApplicationStage'
  label: string
  sub: string
}[] = [
  { key: 'notifyDeadline', label: '마감 임박 공고', sub: '북마크한 공고 마감 3일 전' },
  { key: 'notifyOffer', label: '제안 받음', sub: '' },
  { key: 'notifyComment', label: '댓글과 답글', sub: '' },
  { key: 'notifyAiDone', label: 'AI 작업 완료', sub: '앱을 닫아도 끝나면 알려 드려요' },
  { key: 'notifyApplicationStage', label: '지원 상태 변경', sub: '기업이 내 지원 단계를 바꿨을 때' },
]

export const SETTINGS_CHANNEL_NOTE = '웹에서는 알림함에 쌓여요. 푸시 알림은 앱에서 받아요.'
export const LOCALE_NOTE = '화면과 AI 답변 언어가 함께 바뀌어요'
export const HIDE_COMPANY_LABEL = '현재 회사 사람에게 숨기기'
export const CONSENT_TITLE = '참고 데이터로 쓰기'
export const SETTINGS_LOAD_ERROR = '설정을 불러오지 못했어요.'

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
