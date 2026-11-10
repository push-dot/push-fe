import { needsTerms, type Session } from '@push/api-client'

import { meConsents } from '../../entities/session'

// push-be stores sign-up terms apart from the account and records them only on the email sign-up,
// so every social, phone, or password login asks until they are on record (same check as fo-mobile otp-screen),
// employer Google sign-ups included.
export const termsPending = async (session: Session, read: typeof meConsents = meConsents) =>
  needsTerms(await read(session.accessToken))

export type TermsOutcome = 'ready' | 'pending' | 'blocked'

// A terms read that throws blocks the session. Social and phone logins do the same: nothing is saved until the read succeeds.
export const termsOutcome = async (
  session: Session,
  read: typeof meConsents = meConsents,
): Promise<TermsOutcome> => {
  try {
    return (await termsPending(session, read)) ? 'pending' : 'ready'
  } catch {
    return 'blocked'
  }
}
