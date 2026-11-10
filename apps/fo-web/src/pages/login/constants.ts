export const PROVIDER_NAME = {
  google: 'Google',
  apple: 'Apple',
  github: 'GitHub',
} as const

export const PROVIDER_START_LABEL = {
  google: 'Google로 시작하기',
  apple: 'Apple로 시작하기',
  github: 'GitHub로 시작하기',
  phone: '휴대폰 번호로 시작하기',
} as const

export const GOOGLE_CONTINUE = 'Google로 계속하기'
export const providerLogin = (name: string) => `${name}로 로그인`
export const LOGIN_PERSONAL_TITLE = 'AI와 함께 하는 커리어, Push에서 시작하기'
export const LOGIN_EMPLOYER_TITLE = '기업으로 로그인'
export const LOGIN_PERSONAL_LEAD = '공고를 찾고, 지원하고, 사람을 만나요.'
export const LOGIN_EMPLOYER_LEAD = '사업자 확인을 마치면 공고를 올리고 에이전트를 쓸 수 있어요.'
export const LOGIN_PERSONAL_NOTE = '처음이면 인증만 하면 바로 가입돼요.'
export const LOGIN_SUBMIT_COPY = '로그인'
export const EMAIL_OR = '또는 이메일로'
export const SIGNUP_LINK_COPY = '이메일로 가입하기'
export const FORGOT_COPY = '비밀번호 찾기'
export const EMPLOYER_EMAIL_LABEL = '회사 이메일'
export const EMPLOYER_INVITE_NOTE = '담당자 초대를 받았다면 초대 메일의 링크로 들어와 주세요.'
export const SOCIAL_FAIL_TAIL = ' 로그인에 실패했어요'
export const SOCIAL_FAIL_DETAIL = '잠시 후 다시 시도하거나 다른 방법으로 계속해 주세요.'
export const UNVERIFIED_TITLE = '메일 인증을 아직 마치지 않았어요'
export const UNVERIFIED_TAIL = '으로 보낸 인증 메일의 링크를 누르면 로그인할 수 있어요.'
export const OTHER_METHOD = '다른 방법으로 로그인'

export const PHONE_TITLE = '휴대폰 번호를 입력해 주세요'
export const PHONE_LEAD =
  '지원 결과와 면접 일정을 알려 드릴 번호예요. 다른 사람에게는 보이지 않아요.'
export const PHONE_LABEL = '휴대폰 번호'
export const PHONE_SEND = '인증번호 받기'
export const PHONE_TAKEN_TITLE = '이미 가입된 번호예요'
export const PHONE_TAKEN_HEAD = '이 번호는 '
export const PHONE_TAKEN_TAIL = ' 계정과 연결돼 있어요.'
export const PHONE_TAKEN_OTHER = '이 번호는 다른 계정과 연결돼 있어요.'
export const PHONE_OTHER = '다른 번호 입력하기'
export const CODE_TITLE = '인증번호를 입력해 주세요'
export const CODE_LEAD_TAIL = '로 6자리 번호를 보냈어요.'
export const CODE_PLACEHOLDER = '인증번호 6자리'
export const CODE_SUBMIT = '확인'
export const CODE_COOLDOWN_TAIL = ' 후에 다시 받을 수 있어요'
export const CODE_CHANGE = '번호 바꾸기'
export const CODE_RESEND = '인증번호 다시 받기'
export const CODE_WRONG = '인증번호가 맞지 않아요. 다시 확인해 주세요.'
export const CODE_EXPIRED = '인증번호가 만료됐어요. 새 번호를 받아 주세요.'
export const CODE_SEND_LATER = '잠시 후에 다시 받을 수 있어요.'
export const CODE_LIMIT_DETAIL = '새 인증번호를 받아 다시 입력해 주세요.'
export const CODE_MAX_ATTEMPTS = 5
export const codeLimitTitle = (attempts: number) => `인증번호를 ${attempts}번 잘못 입력했어요`

export const CONSENT_TITLE = '서비스 이용에 동의해 주세요'
export const CONSENT_LEAD = '필수 항목에 동의하면 시작할 수 있어요.'
export const CONSENT_ALL = '전체 동의'
export const REQUIRED_TAG = '[필수]'
export const OPTIONAL_TAG = '[선택]'
export const TERMS_AGE = '만 14세 이상이에요'
export const TERMS_SERVICE = '서비스 이용약관'
export const TERMS_PRIVACY = '개인정보 수집·이용'
export const TERMS_MARKETING = '혜택·이벤트 알림 받기'
export const TERMS_VIEW = '보기'
// privacyConsent (packages/shared legal) names this link on the sign-up consent screen.
export const TERMS_PRIVACY_POLICY = '개인정보 처리방침 보기'
export const TERMS_SERVICE_LINK = '이용약관 보기'
export const TERMS_COLLECTION_LINK = '개인정보 수집·이용 보기'
export const CONSENT_SUBMIT = '동의하고 시작하기'

// Same document per row as the app's TERM_DOCUMENTS (fo-mobile features/auth/constants.ts); routes in app/router.tsx.
export const TERM_VIEW = {
  serviceTerms: '/terms',
  privacy: '/privacy-consent',
  marketing: '/marketing-consent',
} as const

export const NAME_LABEL = '이름'
export const SIGNUP_EMPLOYER_TITLE = '기업 계정 만들기'
export const SIGNUP_LEAD = '인증 메일의 링크를 누르면 계정이 만들어져요.'
export const SIGNUP_SUBMIT_COPY = '인증 메일 보내기'
export const SIGNUP_HAS_ACCOUNT = '이미 계정이 있나요?'
export const PASSWORD_HINT = '8자 이상, 영문과 숫자를 섞어 주세요'
export const TERMS_LABEL = '만 14세 이상이며 이용약관과 개인정보 수집·이용에 동의해요'
export const TERMS_REQUIRED = '필수'

export const VERIFY_MAIL_TITLE = '메일을 확인해 주세요'
export const VERIFY_MAIL_TAIL = '으로 인증 메일을 보냈어요.'
export const VERIFY_MAIL_DONE = '메일의 링크를 누르면 기업 계정이 만들어져요.'
export const VERIFY_MAIL_MISSING = '메일이 오지 않았나요?'
export const VERIFY_MAIL_SPAM = '스팸함을 확인해 주세요. 링크는 24시간 동안 쓸 수 있어요.'
export const VERIFY_MAIL_RESEND = '인증 메일 다시 보내기'
export const VERIFY_RESEND_SENT = '인증 메일을 다시 보냈어요'
export const VERIFY_RESEND_LATER = '잠시 뒤에 다시 보내 주세요'
export const VERIFY_RESEND_FAILED = '인증 메일을 다시 보내지 못했어요'
export const VERIFY_RESEND_COOLDOWN_MS = 60_000
export const VERIFY_MAIL_OTHER = '다른 이메일로 가입하기'
export const VERIFY_EXPIRED_TITLE = '인증 링크가 만료됐어요'
export const VERIFY_EXPIRED_WHY = '인증 메일의 링크는 24시간 동안 쓸 수 있어요.'
export const VERIFY_EXPIRED_NEXT = '메일을 다시 받아 기업 계정을 만들어 주세요.'
export const VERIFY_EXPIRED_TO = '받는 이메일'

export const EXCHANGE_TAIL = '에서 돌아오는 중이에요'
export const EXCHANGE_EMPLOYER = '기업 계정을 확인하고 있어요. 잠시만 기다려 주세요.'
export const EXCHANGE_PERSONAL = '계정을 확인하고 있어요. 잠시만 기다려 주세요.'
export const EXCHANGE_CANCEL = '취소하고 다른 방법으로 로그인'

export const SHOW_PASSWORD = '비밀번호 보기'
export const HIDE_PASSWORD = '비밀번호 숨기기'
export const RESET_TITLE = '비밀번호 찾기'
export const RESET_LEAD =
  '가입한 회사 이메일을 입력하면 비밀번호를 바꿀 수 있는 링크를 보내 드려요.'
export const RESET_SEND_COPY = '재설정 링크 보내기'
export const RESET_GOOGLE_NOTE = 'Google로 가입했다면 비밀번호 없이 Google로 로그인해 주세요.'
export const RESET_SENT_TITLE = '메일을 보냈어요'
export const RESET_SENT_TAIL = '으로 비밀번호 재설정 링크를 보냈어요.'
export const RESET_SENT_NEXT = '메일의 링크를 눌러 새 비밀번호를 정해 주세요.'
export const RESET_SPAM = '스팸함을 확인해 주세요. 링크는 1시간 동안 쓸 수 있어요.'
export const RESET_RESEND = '메일 다시 보내기'
export const BACK_TO_LOGIN = '로그인으로 돌아가기'
export const NEW_PASSWORD_TITLE = '새 비밀번호 정하기'
export const NEW_PASSWORD_LEAD_TAIL = ' 계정의 비밀번호를 바꿔요.'
export const NEW_PASSWORD_LABEL = '새 비밀번호'
export const CONFIRM_PASSWORD_LABEL = '새 비밀번호 확인'
export const CONFIRM_PASSWORD_PLACEHOLDER = '한 번 더 입력'
export const CONFIRM_MISMATCH = '비밀번호가 서로 달라요. 다시 입력해 주세요.'
export const RESET_CONFIRM_COPY = '비밀번호 바꾸기'
export const PASSWORD_CHANGED_COPY = '비밀번호를 바꿨어요'
export const PASSWORD_CHANGED_LOGIN = '새 비밀번호로 로그인해 주세요.'
export const PASSWORD_CHANGED_SESSIONS = '다른 기기에서는 로그아웃됐어요.'
export const PASSWORD_CHANGED_ACTION = '로그인하기'
export const RESET_EXPIRED_TITLE = '링크가 만료됐어요'
export const RESET_EXPIRED_WHY = '링크는 1시간 동안 쓸 수 있어요.'
export const RESET_EXPIRED_NEXT = '새 링크를 받아 다시 바꿔 주세요.'
export const RESET_NEW_LINK = '새 링크 받기'
export const RESET_INVALID_TITLE = '쓸 수 없는 링크예요'
export const RESET_INVALID_WHY = '이미 쓴 링크이거나 주소가 잘못됐어요.'
export const RESET_LIMIT = '메일은 1분에 3번까지 보낼 수 있어요. 잠시 후 다시 보내 주세요.'
export const RESET_SEND_FAILED = '메일을 보내지 못했어요. 잠시 후 다시 시도해 주세요.'

export const MISSING_VERIFY_COPY = '인증 링크가 없어요'
export const LOGIN_FAILED_COPY = '로그인에 실패했어요'
export const TERMS_READ_FAILED =
  '번호는 확인했지만 로그인을 마치지 못했어요. 새 인증번호를 받아 다시 시도해 주세요.'
export const BAD_CREDENTIALS_COPY = '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요.'
export const EMAIL_LABEL = '이메일'
export const PASSWORD_LABEL = '비밀번호'
