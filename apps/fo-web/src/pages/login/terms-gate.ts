import { needsTerms, type Session } from '@push/api-client'

import { meConsents } from '../../entities/session'

// push-be stores sign-up terms apart from the account, so every personal login asks until they are on record
// (same check as fo-mobile otp-screen). Employer accounts agree on the sign-up form.
export const termsPending = async (session: Session, read: typeof meConsents = meConsents) =>
  session.user.accountType === 'PERSONAL' && needsTerms(await read(session.accessToken))
