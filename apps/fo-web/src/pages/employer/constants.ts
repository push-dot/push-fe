import { ApiError, QueueBusyError, type AccessMode, type EmployerStage, type LedgerEntry, type ToolRunState } from '@push/api-client'
import type { ApprovalFailure } from '../../features/employer-chat'
import { creditText } from '../../entities/billing'
import { PLAN_NAME, seatLimit, type EmployerPlanId } from '../../shared/model/employer-plan'

export const BNO_DIGITS = 10
export const START_DT_DIGITS = 8

export const VERIFY_TITLE = '사업자를 확인할게요'
export const VERIFY_LEAD = '국세청 정보와 맞으면 바로 끝나요. 확인을 마쳐야 공고를 올리고 에이전트를 쓸 수 있어요.'
export const LABEL_BNO = '사업자등록번호'
export const LABEL_PNM = '대표자명'
export const LABEL_START = '개업일자'
export const LABEL_BNM = '상호'
export const LABEL_STATUS = '상태'
export const LABEL_ROLE = '내 권한'
export const VERIFY_NAME_HINT = '공고의 회사명으로 쓰여요'
export const VERIFY_STATUS_NOTE = '계속사업자만 확인돼요. 휴업·폐업 상태면 가입할 수 없어요.'
export const VERIFY_SUBMIT = '사업자 확인하기'
export const VERIFY_PENDING = '국세청에서 확인하는 중…'
export const VERIFY_MISMATCH = '국세청 정보와 맞지 않아요'
export const VERIFY_MISMATCH_DETAIL = '대표자명과 개업일자를 사업자등록증과 똑같이 적어 주세요.'
export const VERIFY_RETRY = '개업 직후라면 1–2일 뒤 다시 시도해 주세요'
export const VERIFY_STATUS = '계속사업자'
export const VERIFY_DONE_LEAD = '이제 공고를 올리고 에이전트를 쓸 수 있어요.'
export const VERIFY_DONE_ADMIN = '처음 확인한 분이 관리자가 돼요.'
export const VERIFY_FIRST_POSTING = '첫 공고 올리기'
export const VERIFY_AI_POSTING = '에이전트로 공고 만들기'
export const STEP_ACCOUNT = '계정 만들기'
export const STEP_VERIFY = '사업자 확인'
export const STEP_START = '시작하기'
export const COMPANY_EXISTS_COPY = '이미 등록된 사업자번호예요. 초대 링크로 들어와 주세요.'

export const MEMBERS_TITLE = '담당자 관리'
export const MEMBERS_LOADING = '담당자를 불러오고 있어요.'
export const MEMBERS_FAILED = '담당자를 불러오지 못했어요.'
export const COMPANY_MISSING = '사업자 인증이 필요해요'
export const VERIFY_LINK = '사업자 인증'
export const ROLE_ADMIN = '관리자'
export const ROLE_MEMBER = '담당자'
export const INVITE_EMAIL = '이메일'
export const INVITE_SUBMIT = '초대 메일 보내기'
export const INVITE_SENT = '초대 메일을 보냈어요'
export const INVITE_FAILED_SEND = '초대 메일을 보내지 못했어요.'
export const REMOVE_MEMBER = '내보내기'
export const TRANSFER_ADMIN = '관리자 넘기기'
export const INVITE_ACCEPT_FAILED = '초대를 받지 못했어요. 링크를 다시 확인해 주세요.'
export const INVITE_TITLE = '초대를 받았어요'
export const INVITE_LEAD = '채용 담당자로 초대했어요.'
export const INVITE_CAN = '들어가면 함께 쓸 수 있어요'
export const INVITE_PERKS = ['공고와 지원자 관리', '에이전트 대화 (회사가 함께 봐요)', '사업자 확인 없이 바로 시작'] as const
export const INVITE_GOOGLE = 'Google로 수락하기'
export const INVITE_EMAIL_ACCEPT = '이메일로 가입하고 수락하기'
export const INVITE_LIMIT = '초대받은 이메일로만 들어올 수 있어요 · 7일 뒤 만료돼요'

export const seatCount = (used: number, limit: number, plan: string | null) =>
  `담당자 ${used} / ${limit}명${plan ? ` · ${plan}` : ''} (관리자 제외)`

export const POSTINGS_TITLE = '공고 관리'
export const NEW_POSTING = '새 공고'
export const AI_POSTING = 'AI로 만들기'
export const STATUS_OPEN = '게시 중'
export const STATUS_DRAFT = '초안'
export const STATUS_CLOSED = '마감'
export const FILTER_ALL = '전체'
export const DEADLINE_OPEN = '상시'
export const DEADLINE_NONE = '–'
export const POSTINGS_HEAD = ['공고', '상태', '지원자', '마감'] as const
export const POSTINGS_EMPTY = '등록한 공고가 없어요'
export const POSTINGS_LOADING = '공고를 불러오고 있어요'
export const POSTINGS_FAILED = '공고를 불러오지 못했어요'
export const POSTING_MORE = '더 보기'
export const POSTING_EDIT = '공고 수정'
export const POSTING_APPLICANTS = '지원자 보기'
export const POSTING_CLOSE = '마감하기'
export const POSTING_CLOSE_TITLE = '공고를 마감할까요?'
export const POSTING_CLOSE_BODY = '마감하면 새 지원을 받을 수 없고, 다시 열 수 없어요.'
export const POSTING_CLOSED = '공고를 마감했어요'
export const POSTING_CLOSE_FAILED = '공고를 마감하지 못했어요'
export const AGENT_DRAFT = '에이전트가 쓴 초안'
export const APPLICANT_UNIT = '명'
export const newApplicants = (count: number) => `새 ${count}`
export const josaGa = (name: string) => {
  const last = name.trim().charCodeAt(name.trim().length - 1)
  return last >= 0xac00 && last <= 0xd7a3 && (last - 0xac00) % 28 !== 0 ? '이' : '가'
}
export const postedBy = (name: string) => `${name}${josaGa(name)} 올림`
export const draftBy = (name: string) => `${name}${josaGa(name)} 쓴 초안`
export const APPLICANTS_LINK = '지원자'
export const APPLICANTS_TITLE = '지원자'
export const APPLICANTS_HEAD = ['지원자', '제출 서류', '지원일', '단계'] as const
export const APPLICANTS_EMPTY = '아직 지원자가 없어요'
export const APPLICANTS_EMPTY_BODY = '지원이 들어오면 여기에 모이고, 알림으로 알려 드려요.'
export const VIEW_POSTING = '공고 보기'
export const stageEmpty = (label: string) => `${label} 단계인 지원자가 없어요`
export const DOCS_NONE = '제출한 서류가 없어요'
export const APPLICANTS_LOADING = '지원자를 불러오고 있어요'
export const APPLICANTS_FAILED = '지원자를 불러오지 못했어요'
export const APPLICANTS_NOTE = '단계를 바꾸면 지원자의 지원활동이 같이 바뀌고 알림이 가요.'
export const DOC_PROFILE = '프로필'
export const DOC_PDF = 'PDF'
export const DOC_FILE = '파일'
export const STAGE_APPLIED = '지원함'
export const STAGE_TITLE = '단계'
export const STAGE_RETRY = '다시 시도'
export const STAGE_RETRY_NOTE = '잠시 후 다시 시도해 주세요.'
export const stagePickLabel = (name: string, label: string) => `${name} 단계 ${label}, 바꾸기`
export const stageMoved = (name: string, label: string) => `${name} 님을 ${label} 단계로 옮겼어요`
export const stageNotMoved = (name: string, label: string) => `${name} 님을 ${label} 단계로 옮기지 못했어요`
export const stageNotice = (name: string) => (name ? `바꾸면 ${name} 님에게 “지원 상태 변경” 알림이 가요.` : '바꾸면 지원자에게 “지원 상태 변경” 알림이 가요.')
export const stageFailed = (stage: EmployerStage) =>
  `${{ SCREENING: '서류 통과로', INTERVIEW: '면접으로', OFFER: '합격으로', REJECTED: '불합격으로' }[stage]} 바꾸지 못했어요.`
export const submittedAsIs = (date: string) => `${date} 제출한 그대로예요`
export const DOCUMENT_EMPTY = '내용을 미리 볼 수 없는 파일이에요'
export const SHEET_INTRO = '소개'
export const SHEET_CAREERS = '경력'
export const SHEET_SKILLS = '기술'
// push-be reads careers and skills from the applicant's profile today, not from the submitted snapshot.
export const SHEET_LIVE = '경력과 기술은 지금 프로필 기준이에요'
export const FILE_DOWNLOAD = '파일 받기'
export const FILE_FAILED = '파일을 받지 못했어요'
export const HUB_PROFILE = '허브 프로필 보기'
export const AI_REVIEW = '서류 검토하기'
export const AI_INTERVIEW = '면접 질문 만들기'
export const APPLICANT_LOADING = '지원 내용을 불러오고 있어요'
export const APPLICANT_FAILED = '지원 내용을 불러오지 못했어요'
export const STAGE_ENDED = '이미 끝난 지원이에요'
export const EDITOR_TITLE = '공고 편집'
export const EDITOR_LOADING = '공고를 불러오고 있어요'
export const PREVIEW_POSTING = '미리보기'
export const LABEL_TITLE = '공고 제목'
export const LABEL_JOB_CATEGORY = '직군'
export const LABEL_CAREER = '경력'
export const LABEL_EMPLOYMENT_TYPE = '고용형태'
export const LABEL_LOCATION = '근무지'
export const LABEL_DEADLINE = '마감일'
export const LABEL_DESCRIPTION = '하는 일'
export const LABEL_REQUIREMENTS = '자격 요건'
export const LABEL_PREFERRED = '우대 사항'
export const LABEL_SKILLS = '기술 스택'
export const LABEL_IMAGE = '대표 이미지'
export const LABEL_COMPANY = '회사명'
export const SKILL_ADD = '추가'
export const SKILL_ADD_PLACEHOLDER = '기술 이름'
export const SKILL_REMOVE = '삭제'
export const AI_POLISH = 'AI로 다듬기'
export const COMPANY_NAME_NOTE = '회사명은 사업자 확인에서 가져와요.'
export const SAVE_POSTING = '공고 올리기'
export const SAVE_DRAFT = '초안으로 저장'
export const DRAFT_CONFIRM_TITLE = '초안으로 저장할까요?'
export const DRAFT_CONFIRM_BODY = '저장하면 공고가 내려가고, 다시 올릴 때까지 지원을 받지 않아요.'
export const IMAGE_CHANGE = '이미지 바꾸기'
export const IMAGE_FAILED = '이미지를 올리지 못했어요'
export const CLOSE_POSTING = '마감하기'
export const CLOSED_STATE = '마감된 공고예요'
export const CAREER_RANGES = [
  { label: '신입', min: 0, max: null },
  { label: '1–3년', min: 1, max: 3 },
  { label: '4–6년', min: 4, max: 6 },
  { label: '7–9년', min: 7, max: 9 },
  { label: '10년+', min: 10, max: null },
] as const

export const CHAT_TITLE = '에이전트'
export const CHAT_LOADING = '대화를 불러오고 있어요'
export const CHAT_CREATING = '대화를 만들고 있어요'
export const CHAT_FAILED = '대화를 불러오지 못했어요'
export const CHAT_EMPTY = '아직 대화가 없어요'
export const STARTER_POSTING = '새 공고'
export const STARTER_REVIEW = '서류 검토'
export const STARTER_INTERVIEW = '면접 준비'
export const INTERVIEW_LOCK = 'Pro부터 면접 질문을 만들 수 있어요'
export const PLANS_LINK = '요금제 보기'
export const REFERENCE_POSTING = '참고 공고'
export const PDF_ATTACH = '외부 PDF'
export const PDF_LOCK = 'Ultra에서 외부 PDF를 올릴 수 있어요'
export const APPLICANT_ATTACH = '지원자 첨부'
export const APPLICANT_NONE = '선택 안 함'
export const COMPOSER_LABEL = '메시지'
export const SEND_MESSAGE = '보내기'
export const DRAFT_POSTING = '공고 편집에서 열기'
export const DRAFT_BADGE = '초안'
export const CHAT_NEW = '새 대화'
export const CHAT_SHARED = '회사 대화 · 담당자 모두 볼 수 있어요'
export const CHAT_TOPUP = '충전하기'
export const COMPOSER_PLACEHOLDER = '메시지를 입력하세요'
export const ATTACH_LABEL = '공고·지원자'
export const CHAT_USER = '나'
export const CHAT_ASSISTANT = '에이전트'
export const ACCESS_MODE_GROUP = 'AI 실행 방식'
export const ACCESS_MODES = [
  { value: 'ALWAYS_ASK', label: '항상 묻기', description: '바꾸기 전에 매번 물어봐요' },
  { value: 'AUTO', label: '자동', description: '나만 바뀌는 일은 바로 하고, 다른 사람에게 닿는 일은 물어봐요' },
  { value: 'BYPASS', label: '바로 실행', description: '묻지 않고 실행해요' },
] as const satisfies readonly { value: AccessMode; label: string; description: string }[]
export const TOOL_STATE_LABEL: Record<ToolRunState, string> = { run: '진행 중', wait: '확인 필요', ok: '완료', err: '실패' }
export const AWAITING_APPROVAL = '확인을 기다리고 있어요'
export const APPROVAL_FAILURE: Record<ApprovalFailure, string> = {
  resolved: '이미 답한 요청이에요',
  expired: '확인 시간이 지났어요. 다시 요청해 주세요.',
  failed: '답을 보내지 못했어요. 잠시 후 다시 시도해 주세요.',
}
export const CHAT_CREDITS = '크레딧이 모자라요. 충전하고 다시 보내 주세요.'
export const CHAT_CREDITS_CLOSED = '크레딧이 다 떨어졌어요. 결제는 아직 준비 중이에요.'
export const PLAN_REQUIRED_CLOSED = '이 기능은 상위 요금제에서 쓸 수 있어요. 결제는 아직 준비 중이에요.'
export const CHAT_BUSY = '지금 요청이 많아요. 잠시 후 다시 보내 주세요.'
export const STREAM_ERROR_TEXT: Record<string, string> = {
  NOT_CONFIGURED: '지금은 에이전트를 쓸 수 없어요. 잠시 뒤에 다시 해 주세요.',
  QUEUE_BUSY: '지금 요청이 많아요. 잠시 뒤에 다시 보내 주세요.',
  PLAN_REQUIRED: '요금제를 올리면 쓸 수 있어요.',
  FEATURE_DISABLED: CHAT_CREDITS,
  INSUFFICIENT_CREDITS: CHAT_CREDITS,
}
export const DEFAULT_STREAM_ERROR_TEXT = '작업을 이어가지 못했어요. 다시 보내 주세요.'

const queueBusyText = (sec: number) => `지금 요청이 많아요. ${sec}초 뒤에 다시 보내 주세요.`

const retryAfterSec = (error: ApiError) => {
  if (error instanceof QueueBusyError) return error.retryAfterSec
  const value = error.details?.retryAfterSec
  return typeof value === 'number' ? value : undefined
}

const CLOSED_STREAM_ERROR_TEXT: Record<string, string> = {
  PLAN_REQUIRED: PLAN_REQUIRED_CLOSED,
  FEATURE_DISABLED: CHAT_CREDITS_CLOSED,
  INSUFFICIENT_CREDITS: CHAT_CREDITS_CLOSED,
}

// While payments are closed the credit and plan lines state the fact instead of sending people to pay.
export const streamErrorText = (error: unknown, paymentsOpen = true) => {
  if (!(error instanceof ApiError)) return DEFAULT_STREAM_ERROR_TEXT
  const sec = error.code === 'QUEUE_BUSY' ? retryAfterSec(error) : undefined
  if (sec) return queueBusyText(sec)
  return (paymentsOpen ? undefined : CLOSED_STREAM_ERROR_TEXT[error.code]) ?? STREAM_ERROR_TEXT[error.code] ?? DEFAULT_STREAM_ERROR_TEXT
}

export const PLANS_TITLE = '기업 요금제'
export const PLANS_LOADING = '요금제를 불러오고 있어요'
export const PLANS_PERSONAL = '기업 요금제는 기업 계정에서 구독해요'
export const PLAN_CURRENT = '지금 쓰는 중'
export const PLAN_SUBSCRIBE = '구독하기'
export const PLAN_ACTION_FAILED = '요금제 변경을 시작하지 못했어요'
export const PAYMENTS_CLOSED = '결제는 아직 준비 중이에요'
export const planActionError = (error: unknown) =>
  error instanceof ApiError && error.code === 'PAYMENTS_DISABLED' ? PAYMENTS_CLOSED : PLAN_ACTION_FAILED
export const PLAN_USAGE_TITLE = '이번 달 사용량'
export const PLAN_USAGE_RESET = '매월 1일에 사용량이 다시 채워져요.'
export const PLAN_BUY_TITLE = '크레딧 구매'
export const PLAN_BUY_HINT = '이번 달 크레딧이 모자라면 더 살 수 있어요'
export const PLAN_BUY = '구매'
export const PLAN_BUY_PACKS = '구매할 팩 수'
export const PLAN_BUY_PACK_HINT = '1팩에 1,500크레딧 · $10예요. 한 번에 20팩까지 살 수 있어요.'
export const buyTotal = (packs: number) => `${creditText(packs * 1500)}크레딧 · $${packs * 10}`
export const PLAN_HISTORY = '결제 내역'
export const PLAN_CLOSE = '닫기'
export const PLAN_CANCEL = '취소'
export const PLAN_LEAD = '요금제마다 쓸 수 있는 양이 달라요'
export const PLAN_PER_MONTH = '/ 월'
export const PLAN_NOTE = '요금제는 에이전트에만 적용돼요. 공고 등록과 지원자 관리는 요금제 없이도 쓸 수 있어요. 결제와 변경은 관리자만 해요 · 월 구독 · USD'
export const PLAN_SECURE = 'Stripe로 안전하게 결제돼요'
export const PLAN_CANCELED_TITLE = '결제를 취소했어요'
export const PLAN_CANCELED_BODY = '요금은 나가지 않았어요. 요금제와 크레딧은 그대로예요.'
export const PLAN_VIEWER_TITLE = '요금제는 관리자만 바꿀 수 있어요'
export const planViewerBody = (admin?: string) =>
  admin ? `바꾸거나 크레딧을 사려면 관리자 ${admin} 님에게 말해 주세요.` : '바꾸거나 크레딧을 사려면 관리자에게 말해 주세요.'
export const TOPUP_DONE = '크레딧을 구매했어요'
export const LEDGER_LOADING = '결제 내역을 불러오고 있어요'
export const LEDGER_FAILED = '결제 내역을 불러오지 못했어요'
export const LEDGER_EMPTY = '아직 결제 내역이 없어요'
export const LEDGER_REFUND = '환불'
export const LEDGER_RECEIPT = '영수증'
export const LEDGER_MORE = '더 보기'

export const PLAN_BLURB = {
  BASIC: '기본 사용량',
  PRO: 'Basic의 5배 사용량',
  ULTRA: 'Pro의 2배 사용량',
} as const

const endsWithVowel = (name: string) => /[aeiouy]$/i.test(name)

export const planPaid = (name?: string) => (name ? `결제를 마쳤어요. 이제 ${name}${endsWithVowel(name) ? '를' : '을'} 써요` : '결제를 마쳤어요')

export const planUsedPercent = (spentMicroCredits: number, monthlyMicroCredits: number) =>
  monthlyMicroCredits > 0 ? Math.min(100, Math.max(0, Math.round((spentMicroCredits / monthlyMicroCredits) * 100))) : 0

export const planUsed = (percent: number) => `이번 달 ${percent}% 썼어요`

export const ledgerSubtitle = (company: string, count: number) => `${company} · 최근 ${count}건`

export const ledgerDate = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date(iso))

const usd = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: Number.isInteger(amount) ? 0 : 2 }).format(amount)

// A refund row is negative in USD; the sign goes before the dollar sign.
// 결제 내역 = Stripe payments only (rows with amountUsd), in the server's order. A refund row whose label is missing reads 환불.
export const ledgerPayments = (rows: readonly LedgerEntry[]) =>
  rows.flatMap(({ id, type, description, amountUsd, receiptUrl, createdAt }) =>
    amountUsd == null ? [] : [{ id, createdAt, amountUsd, receiptUrl, title: description ?? (type === 'REFUND' ? LEDGER_REFUND : PLAN_HISTORY) }],
  )

export const ledgerUsd = (amountUsd: number) => (amountUsd < 0 ? `-${usd(-amountUsd)}` : usd(amountUsd))

export const PLAN_FEATURES = {
  BASIC: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: false },
    { label: '외부 PDF 검토', on: false },
    { label: '담당자 초대', on: false },
  ],
  PRO: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: true },
    { label: '외부 PDF 검토', on: false },
    { label: '담당자 2명 초대', on: true },
  ],
  ULTRA: [
    { label: 'AI 공고 생성', on: true },
    { label: 'AI 서류 검토', on: true },
    { label: 'AI 면접 준비', on: true },
    { label: '외부 PDF 검토', on: true },
    { label: '담당자 5명 초대', on: true },
  ],
} as const

export const MEMBER_SELF = '나'
export const MEMBERS_PERM_TITLE = '권한'
export const MEMBERS_ADMIN_CAN = '결제, 요금제 변경, 담당자 초대·내보내기'
export const MEMBERS_MEMBER_CAN = '공고, 지원자, 에이전트 대화를 함께 써요'
export const MEMBERS_ACTION_FAILED = '처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
export const MEMBERS_CLOSE = '닫기'
export const SEAT_FULL_TITLE = '담당자 자리가 꽉 찼어요'
export const SEAT_FULL_PLANS = '요금제 보기'
export const INVITE_DIALOG_TITLE = '담당자 초대'
export const INVITE_CANCEL = '취소'
export const TRANSFER_CONFIRM = '넘기기'
export const MEMBER_MORE = '더 보기'
export const INVITE_PENDING_TITLE = '초대 보냄'
export const INVITE_PENDING = '대기 중'
export const INVITE_RESEND = '초대 다시 보내기'
export const INVITE_RESENT = '초대 메일을 다시 보냈어요'
export const INVITE_REVOKE = '초대 취소'
export const INVITE_REVOKED = '초대를 취소했어요'
export const INVITE_REVOKE_BODY = '보낸 초대 링크로는 더 들어올 수 없어요. 자리는 바로 비어요.'
export const MEMBERS_ADMIN_ONLY = '관리자만 할 수 있어요. 권한이 바뀌었는지 확인해 주세요.'
export const INVITE_GONE = '이미 수락했거나 취소된 초대예요'
export const MEMBER_GONE = '이미 회사를 나간 담당자예요'
export const revokeTitle = (email: string) => `${email} 초대를 취소할까요?`
export const resendWait = (sec: number) => `${sec}초 뒤에 다시 보낼 수 있어요`

const DAY_MS = 86_400_000

export const inviteExpiry = (email: string, expiresAt: string, now = Date.now()) => {
  const days = Math.ceil((Date.parse(expiresAt) - now) / DAY_MS)
  return `${email} · ${days > 0 ? `${days}일 뒤 만료` : '만료됨'}`
}

// Korean names show the given name (last two syllables) like the boards; anything else its first letter.
export const memberInitials = (name: string) => {
  const chars = [...name.trim()]
  return /^[가-힣]{3,}$/.test(name.trim()) ? chars.slice(-2).join('') : (chars[0] ?? '').toUpperCase()
}

// Every member and invite write is ADMIN only on push-be; resend has its own cooldown and seat answers.
export const memberActionError = (error: unknown, member = false) => {
  if (!(error instanceof ApiError)) return MEMBERS_ACTION_FAILED
  if (error.status === 429) {
    const sec = retryAfterSec(error)
    return sec ? resendWait(sec) : MEMBERS_ACTION_FAILED
  }
  if (error.code === 'SEAT_LIMIT') return SEAT_FULL_TITLE
  if (error.status === 403) return MEMBERS_ADMIN_ONLY
  if (error.status === 404 && error.code === 'NOT_FOUND') return member ? MEMBER_GONE : INVITE_GONE
  return MEMBERS_ACTION_FAILED
}
export const inviteLead = (company: string) => `초대받은 사람은 사업자 확인 없이 ${company}로 들어와요.`

type SeatPlan = 'PRO' | 'ULTRA'

export const seatPlan = (plan: EmployerPlanId): SeatPlan | null => (plan === 'PRO' || plan === 'ULTRA' ? plan : null)

export const seatFullBody = (plan: SeatPlan) =>
  `${PLAN_NAME[plan]}는 관리자 말고 담당자를 ${seatLimit(plan)}명까지 둘 수 있어요. 초대 대기 중인 사람도 1명으로 세요.${plan === 'PRO' ? ` Ultra는 ${seatLimit('ULTRA')}명까지예요.` : ''}`

export const inviteFullNote = (plan: SeatPlan) =>
  `${PLAN_NAME[plan]}는 담당자 ${seatLimit(plan)}명까지 초대할 수 있어요. 더 초대하려면 ${plan === 'PRO' ? 'Ultra로 올리거나 ' : ''}기존 담당자를 내보내 주세요.`

export const adminOnlyNote = (admin?: string) =>
  admin ? `담당자 초대와 내보내기는 관리자 ${admin} 님만 할 수 있어요.` : '담당자 초대와 내보내기는 관리자만 할 수 있어요.'

export const removeTitle = (name: string) => `${name} 님을 내보낼까요?`
export const removeBody = (company: string, name: string) =>
  `내보내면 ${company}의 공고, 지원자, 에이전트 대화를 더 볼 수 없어요. ${name} 님이 만든 공고와 대화는 회사에 남아요.`
export const transferTitle = (name: string) => `${name} 님에게 관리자를 넘길까요?`
export const transferBody = (name: string, self: string) =>
  `넘기면 결제, 요금제 변경, 담당자 초대·내보내기는 ${name} 님만 할 수 있어요. ${self} 님은 담당자가 돼요.`

export const planSwitchLabel = (name: string, current: boolean, higher: boolean, hasPlan: boolean) => {
  if (current) return PLAN_CURRENT
  if (!hasPlan) return PLAN_SUBSCRIBE
  return `${name}${endsWithVowel(name) ? '로' : '으로'} ${higher ? '올리기' : '바꾸기'}`
}
