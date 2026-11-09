export type LegalKind = 'terms' | 'privacy'

export const LEGAL_TABS = [
  { kind: 'terms', to: '/terms', label: '이용약관' },
  { kind: 'privacy', to: '/privacy', label: '개인정보 처리방침' },
] as const

export const LEGAL_TITLE: Record<LegalKind, string> = { terms: '서비스 이용약관', privacy: '개인정보 처리방침' }

export const LEGAL_EFFECTIVE = '시행일 2026년 10월 29일 · 버전 1.0'
export const LEGAL_PENDING = '원문이 확정되면 이 자리에 들어가요.'
export const LEGAL_BODY_PENDING = '[조문 내용]'

export const LEGAL_SECTIONS: Record<LegalKind, readonly string[]> = {
  terms: ['제1조(목적)', '제2조(정의)', '제3조(약관의 효력과 변경)', '제4조(서비스 이용)', '제5조(이용자의 의무)', '제6조(책임의 제한)'],
  privacy: ['1. 수집하는 개인정보', '2. 개인정보의 이용 목적', '3. 보관 기간과 파기', '4. 제3자 제공과 처리 위탁', '5. 이용자의 권리', '6. 문의처'],
}
