export const MOCK_FIT_DELAY_MS = 1200
export const APPLIED_TOAST = '지원했어요. 내 활동에서 진행 상황을 볼 수 있어요'
export const APPLY_LABEL = '지원하기'
export const APPLIED_LABEL = '지원 완료'
export const BOOKMARK_LABEL = '북마크'
export const SHARE_LABEL = '공유'
export const EMPLOYER_POSTING_CTA = '이 공고 참고해서 만들기'
export const EMPLOYER_POSTING_NOTE = '기업 AI 채팅이 열리고 이 공고가 첨부돼요'
export const EMPLOYER_VERIFY_PATH = '/employer/verify'
export const APPLY_CONFIRM = '이 서류로 지원하기'
export const SOURCE_ORIGINAL = '원본'
export const SOURCE_AI = 'AI로 맞춘 서류'
export const APPLY_TITLE = '어떤 서류로 지원할까요?'
export const APPLY_LOCK = '지원한 뒤에는 서류를 고쳐도 회사에는 제출한 그대로 보여요.'
export const APPLY_ASIDE = 'Push로 지원하면 고른 서류가 회사에 그대로 전달돼요.'
export const APPLY_CANCEL = '취소'
export const BOOKMARK_SAVED = '저장됨'
export const GUEST_APPLY_TITLE = '로그인하고 지원해요'
export const GUEST_APPLY_BODY = '로그인하면 이 공고로 돌아와서 바로 지원할 수 있어요.'
export const SIGN_UP = '회원가입'

export const applyConfirmLabel = (count: number) => `서류 ${count}개로 지원하기`

export const guestApplyAction = (mode: 'webview' | 'guest' | 'personal' | 'employer', applied: boolean) => {
  if (mode === 'personal' && applied) return 'done'
  if (mode === 'personal') return 'sheet'
  if (mode === 'guest') return 'dialog'
  return 'ignore'
}
