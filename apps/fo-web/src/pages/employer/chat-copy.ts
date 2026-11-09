import { EMPLOYMENT_TYPES } from '@push/api-client'
import { careerLabel } from '@push/shared'
import type { ChatIntent, PostingDraft } from '../../shared/model/employer-chat'

export const CHAT_LIST_LABEL = '대화 목록'
export const CHAT_BUY = '크레딧 구매'
export const CHAT_UPGRADE = '요금제 올리기'
export const usedText = (percent: number) => `이번 달 ${percent}% 썼어요`

export const ATTACH_MENU = '첨부'
export const PDF_UPLOAD = '외부 PDF 올리기'
export const PDF_REMOVE = '첨부 빼기'
export const PDF_BADGE = 'PDF'
export const pageCount = (pages: number) => `${pages}쪽`
export const STOP_MESSAGE = '멈추기'
export const PICK_NONE = '첨부하지 않기'
export const AWAITING_PLACEHOLDER = '승인하거나 취소하면 이어서 할게요'

export const APPROVAL_NEEDED = '승인이 필요해요'
export const APPROVAL_WAITING = '기다리는 중'
export const CHOICE_FOOT = '번호를 누르거나 바로 말해도 돼요 · ↑↓ Enter'
export const CHECK_POINT = '확인할 점'
export const WRITING = '답변 쓰는 중'
export const TOOL_STOPPED = '멈췄어요'
export const TURN_ENDED = { stopped: '여기서 멈췄어요', failed: '답변을 끝까지 쓰지 못했어요' } as const
export const COPY = '복사'
export const COPIED = '복사했어요'
export const SAVE_PDF = 'PDF로 저장'
export const OPEN_APPLICANT = '지원자 서류 열기'
export const INTERVIEW_ASK = '면접 질문 만들어 줘'
export const INTERVIEW_MAKE = '면접 질문 만들기'
export const REVIEW_ASK = '서류 검토해 줘'
export const DRAFT_HEAD = '공고 초안 v1'
export const DRAFT_EDIT = '직접 고치기'
export const DRAFT_REDO = '다시 쓰기'
export const DRAFT_REDO_ASK = '초안을 다시 써 줘'
/** WebBizAiDraft's line under the title: 회사 · 지역 · 경력 · 고용형태, each part only when it is known. */
export const draftMeta = (draft: PostingDraft, company: string | undefined) => {
  const career =
    draft.careerMin === undefined
      ? null
      : careerLabel({ careerMin: draft.careerMin, careerMax: draft.careerMax ?? null })
  // The fence writes FULL_TIME, the posting full_time.
  const kind = draft.employmentType?.toLowerCase()
  return [
    company,
    draft.location,
    career && career !== '신입' ? `경력 ${career}` : career,
    EMPLOYMENT_TYPES.find((item) => item.key === kind)?.label,
  ]
    .filter(Boolean)
    .join(' · ')
}

export const QUEUE_TITLE = '지금 요청이 많아 순서를 기다리고 있어요'
export const QUEUE_BODY = '차례가 되면 바로 시작해요. 이 화면을 나가도 이어서 진행돼요.'
export const queueAhead = (ahead: number) => `앞에 대기 ${ahead}건`

export const LIMIT_TITLE = '이번 달 사용량을 다 썼어요. 요금제를 올리거나 크레딧을 구매할 수 있어요.'
export const LIMIT_TITLE_ULTRA = '이번 달 사용량을 다 썼어요. 크레딧을 구매하면 바로 이어서 쓸 수 있어요.'
export const LIMIT_REFILL = '매월 1일에 사용량이 다시 채워져요.'
export const LIMIT_ADMIN_ONLY = '요금제 변경과 구매는 관리자만 할 수 있어요'

export const LOCK_TITLE = '면접 준비는 Pro부터 쓸 수 있어요'
const LOCK_BODY = '서류 검토에서 짚은 부분을 이어받아, 검증 질문과 확인할 점을 만들어 드려요.'
export const lockBody = (plan: string | null) => (plan ? `${LOCK_BODY} 지금은 ${plan}이에요.` : LOCK_BODY)
export const LOCK_REVIEW_ONLY = '서류 검토만 하기'
export const LOCK_ADMIN_ONLY = '요금제는 관리자만 바꿀 수 있어요'

export const PDF_NOTE = 'Push 밖에서 받은 서류도 올려서 검토할 수 있어요. 올린 PDF는 이 대화에만 붙고, 대화를 지우면 함께 지워져요.'

export const STARTER_TITLE = '오늘은 무엇부터 할까요?'
export const STARTER_BODY = '공고 만들기부터 면접 준비까지 함께 해요. 회사 담당자 모두 이 대화를 볼 수 있어요.'

export type StarterCard = { intent: ChatIntent; title: string; example: string; icon: 'doc' | 'people' | 'search' | 'chat' }

export const STARTER_CARDS: StarterCard[] = [
  { intent: 'posting', title: '공고 만들기', example: '데이터 엔지니어 공고 초안 써 줘', icon: 'doc' },
  { intent: 'general', title: '지원자 정리', example: '이번 주 새 지원자 정리해 줘', icon: 'people' },
  { intent: 'review', title: '서류 검토', example: '지원자 서류 검토해 줘', icon: 'search' },
  { intent: 'interview', title: '면접 질문', example: '결제 승인 백엔드 면접 질문 만들어 줘', icon: 'chat' },
]

// The board's example names a real applicant, so the card uses the first applicant of the open posting when there is one.
export const reviewExample = (name: string | undefined) => (name ? `${name} 님 서류 검토해 줘` : '지원자 서류 검토해 줘')

export const POSTING_OPEN_KICKER = '공고 · 게시 중'
export const POSTING_CLOSED_KICKER = '공고 · 마감'
export const referenceKicker = (company: string) => `참고 공고 · ${company}`
// The board names the posting without its stack suffix: "결제 승인 백엔드 엔지니어 (Kotlin)" reads as the first part.
export const applicantKicker = (posting: string) => {
  const name = posting.replace(/\s*\([^)]*\)\s*$/, '')
  return name ? `지원자 · ${name}` : '지원자'
}
/** Only a member who cannot pay is told who can, and only while payments are open. */
export const lockAdminNote = (admin: boolean, payable: boolean) =>
  payable && !admin ? LOCK_ADMIN_ONLY : null
export const quoted = (text: string) => `“${text}”`
