import { LEGAL_VERSION } from '@push/shared'

import type { Consent } from './types'

// Sign-up terms are stored apart from account creation, so every login checks them (the app and the web share this).
// A stored terms.version from an older text also sends the account back to consent.
export const needsTerms = (consent: Pick<Consent, 'terms'>, version = LEGAL_VERSION) =>
  !consent.terms?.age14At || !consent.terms.serviceTermsAt || !consent.terms.privacyAt || consent.terms.version !== version
