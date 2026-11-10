import type { Consent, Session } from '@push/api-client'
import { needsTerms } from '@push/api-client'

export type ColdStartTermsOutcome = 'current' | 'routed' | 'silent'

type TermsActions = {
  hold: (session: Session) => void
  route: () => void
}

export const evaluateColdStartTerms = (consent: Consent, session: Session, actions: TermsActions): ColdStartTermsOutcome => {
  if (!needsTerms(consent)) return 'current'
  actions.hold(session)
  actions.route()
  return 'routed'
}

export const runColdStartTermsCheck = async (
  session: Session,
  readConsents: (accessToken: string) => Promise<Consent>,
  actions: TermsActions,
): Promise<ColdStartTermsOutcome> => {
  try {
    const consent = await readConsents(session.accessToken)
    return evaluateColdStartTerms(consent, session, actions)
  } catch {
    return 'silent'
  }
}
