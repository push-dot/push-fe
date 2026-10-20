export const BNO_DIGITS = 10
export const START_DT_DIGITS = 8

export const VERIFY_TITLE = '사업자 확인'
export const LABEL_BNO = '사업자번호'
export const LABEL_PNM = '대표자명'
export const LABEL_START = '개업일자'
export const LABEL_BNM = '상호'
export const VERIFY_SUBMIT = '사업자 인증'
export const VERIFY_PENDING = '확인하고 있어요'
export const VERIFY_RETRY = '개업 직후라면 1–2일 뒤 다시 시도해 주세요'
export const COMPANY_EXISTS_COPY = '이미 등록된 사업자번호예요. 초대 링크로 들어와 주세요.'

export const MEMBERS_TITLE = '담당자'
export const MEMBERS_LOADING = '담당자를 불러오고 있어요.'
export const MEMBERS_FAILED = '담당자를 불러오지 못했어요.'
export const COMPANY_MISSING = '사업자 인증이 필요해요'
export const VERIFY_LINK = '사업자 인증'
export const ROLE_ADMIN = '관리자'
export const ROLE_MEMBER = '담당자'
export const INVITE_ADMIN_ONLY = '담당자 초대는 관리자만 할 수 있어요'
export const INVITE_BASIC = 'Basic에서는 담당자를 초대할 수 없어요'
export const INVITE_EMAIL = '이메일'
export const INVITE_SUBMIT = '초대 메일 보내기'
export const INVITE_SENT = '초대 메일을 보냈어요'
export const INVITE_FAILED_SEND = '초대 메일을 보내지 못했어요.'
export const REMOVE_MEMBER = '내보내기'
export const TRANSFER_ADMIN = '관리자 넘기기'
export const INVITE_ACCEPT_FAILED = '초대를 받지 못했어요. 링크를 다시 확인해 주세요.'

export const seatCount = (used: number, limit: number) => `담당자 ${used}/${limit}`

export const inviteLimitCopy = (used: number, limit: number) => `담당자 ${used}/${limit}명까지 초대할 수 있어요`
