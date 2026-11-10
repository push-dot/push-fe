import { needsTerms, type Session } from '@push/api-client'

import { meConsents } from '../../entities/session'

// push-be stores sign-up terms apart from the account and records them only on the email sign-up,
// so every social or phone login asks until they are on record (same check as fo-mobile otp-screen),
// employer Google sign-ups included.
export const termsPending = async (session: Session, read: typeof meConsents = meConsents) =>
  needsTerms(await read(session.accessToken))
