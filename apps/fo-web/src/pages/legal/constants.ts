import { LEGAL_DOCUMENTS } from '@push/shared'

export type LegalKind = 'terms' | 'privacy'

export const LEGAL_TABS = [
  { kind: 'terms', to: '/terms', label: '이용약관' },
  { kind: 'privacy', to: '/privacy', label: '개인정보 처리방침' },
] as const

// The app renders the same documents from @push/shared.
export const LEGAL_DOC = {
  terms: LEGAL_DOCUMENTS.termsOfService,
  privacy: LEGAL_DOCUMENTS.privacyPolicy,
} as const
