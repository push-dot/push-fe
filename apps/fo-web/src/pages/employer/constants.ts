import type { AccessMode, ToolRunState } from '@push/api-client'
import type { ApprovalFailure } from '../../features/employer-chat'
import { creditCount, creditText } from '../../entities/billing'

export const BNO_DIGITS = 10
export const START_DT_DIGITS = 8

export const VERIFY_TITLE = '사업자를 확인할게요'
export const VERIFY_LEAD = '국세청 정보와 맞으면 바로 끝나요. 확인을 마쳐야 공고를 올리고 기업 AI를 쓸 수 있어요.'
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
export const VERIFY_DONE_LEAD = '이제 공고를 올리고 기업 AI를 쓸 수 있어요.'
export const VERIFY_DONE_ADMIN = '처음 확인한 분이 관리자가 돼요.'
export const VERIFY_FIRST_POSTING = '첫 공고 올리기'
export const VERIFY_AI_POSTING = '기업 AI로 공고 만들기'
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
export const INVITE_PERKS = ['공고와 지원자 관리', '기업 AI 대화 (회사가 함께 봐요)', '사업자 확인 없이 바로 시작'] as const
export const INVITE_GOOGLE = 'Google로 수락하기'
export const INVITE_EMAIL_ACCEPT = '이메일로 가입하고 수락하기'
export const INVITE_LIMIT = '초대받은 이메일로만 들어올 수 있어요 · 7일 뒤 만료돼요'

export const seatCount = (used: number, limit: number, plan: string | null) =>
  `담당자 ${used} / ${limit}명${plan ? ` · ${plan}` : ''} (관리자 제외)`

export const POSTINGS_TITLE = '공고 관리'
export const NEW_POSTING = '새 공고'
export const AI_POSTING = 'AI로 만들기'
export const STATUS_OPEN = '게시 중'
export const STATUS_CLOSED = '마감'
export const FILTER_ALL = '전체'
export const DEADLINE_OPEN = '상시'
export const EDITOR_TITLE = '공고 편집'
export const COMPANY_NAME_NOTE = '회사명은 사업자 확인에서 가져와요.'
export const POSTINGS_EMPTY = '등록한 공고가 없어요'
export const POSTINGS_LOADING = '공고를 불러오고 있어요'
export const POSTINGS_FAILED = '공고를 불러오지 못했어요'
export const CLOSED_LABEL = '마감'
export const APPLICANTS_LINK = '지원자'
export const APPLICANTS_TITLE = '지원자'
export const APPLICANTS_EMPTY = '지원자가 없어요'
export const APPLICANTS_LOADING = '지원자를 불러오고 있어요'
export const APPLICANTS_FAILED = '지원자를 불러오지 못했어요'
export const APPLICANTS_NOTE = '단계를 바꾸면 지원자의 지원활동이 같이 바뀌고 알림이 가요.'
export const STAGE_APPLIED = '지원함'
export const stageNotice = (name: string) => (name ? `바꾸면 ${name} 님에게 “지원 상태 변경” 알림이 가요.` : '바꾸면 지원자에게 “지원 상태 변경” 알림이 가요.')
export const AI_REVIEW = '기업 AI 서류 검토하기'
export const AI_INTERVIEW = '면접 질문 만들기'
export const APPLICANT_FILTER_ALL = '전체'
export const APPLICANT_LOADING = '지원 내용을 불러오고 있어요'
export const APPLICANT_FAILED = '지원 내용을 불러오지 못했어요'
export const STAGE_CHANGED = '단계를 바꿨어요. 지원자에게 알려 드려요'
export const STAGE_ENDED = '이미 끝난 지원이에요'
export const STAGE_FAILED = '단계를 바꾸지 못했어요'
export const LABEL_TITLE = '제목'
export const LABEL_DESCRIPTION = '하는 일'
export const LABEL_REQUIREMENTS = '자격 요건'
export const LABEL_PREFERRED = '우대 사항'
export const LABEL_WORK_CONDITIONS = '근무 조건'
export const LABEL_JOB_CATEGORY = '직군'
export const LABEL_CAREER_MIN = '경력'
export const LABEL_LOCATION = '지역'
export const LABEL_EMPLOYMENT_TYPE = '고용형태'
export const LABEL_DEADLINE = '마감일'
export const CREATE_POSTING = '등록하기'
export const SAVE_POSTING = '저장하기'
export const CLOSE_POSTING = '마감하기'
export const EDITOR_LOADING = '공고를 불러오고 있어요'
export const CLOSED_STATE = '마감된 공고예요'

export const CHAT_TITLE = '기업 AI'
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
export const CHAT_ASSISTANT = '기업 AI'
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
export const CHAT_BUSY = '지금 요청이 많아요. 잠시 후 다시 보내 주세요.'

export const PLANS_TITLE = '기업 요금제'
export const PLANS_LOADING = '요금제를 불러오고 있어요'
export const PLANS_PERSONAL = '기업 요금제는 기업 계정에서 구독해요'
export const PLAN_CURRENT = '지금 쓰는 중'
export const PLAN_NOW = '지금'
export const PLAN_DEPTH = '사용량 ↑ · 더 깊이 분석'
export const PLAN_RECOMMENDED = '추천'
export const PLAN_SUBSCRIBE = '구독하기'
export const PLAN_TOPUP = '충전'
export const PLAN_AMOUNT = '충전 금액'
export const PLAN_ADMIN_ONLY = '요금제 변경은 관리자만 할 수 있어요'
export const PLAN_RENEWAL = '매월 1일에 크레딧이 충전돼요'
export const PLAN_ACTION_FAILED = '요금제 변경을 시작하지 못했어요'
export const TOPUP_DONE = '크레딧을 충전했어요'
export const planStarted = (name: string) => `${name} 구독을 시작했어요`

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
export const MEMBERS_ADMIN_CAN = '관리자 · 결제, 요금제 변경, 담당자 초대·내보내기'
export const MEMBERS_MEMBER_CAN = '담당자 · 공고, 지원자, 기업 AI 대화를 함께 써요'
export const INVITE_DIALOG_TITLE = '담당자 초대'
export const INVITE_CANCEL = '취소'
export const inviteLead = (company: string) => `초대받은 사람은 사업자 확인 없이 ${company}로 들어와요.`

export const remainingCredits = (balanceMicroCredits: number) => `남은 크레딧 ${creditText(creditCount(balanceMicroCredits))}`

export const planSwitchLabel = (name: string, current: boolean, higher: boolean, hasPlan: boolean) => {
  if (current) return PLAN_CURRENT
  if (!hasPlan) return PLAN_SUBSCRIBE
  return higher ? `${name}로 올리기` : `${name}로 바꾸기`
}
