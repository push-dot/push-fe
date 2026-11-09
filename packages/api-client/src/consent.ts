import type { Consent } from './types'

// Sign-up terms are stored apart from account creation, so every login checks them (the app and the web share this).
export const needsTerms = (consent: Pick<Consent, 'terms'>) =>
  !consent.terms?.age14At || !consent.terms.serviceTermsAt || !consent.terms.privacyAt
