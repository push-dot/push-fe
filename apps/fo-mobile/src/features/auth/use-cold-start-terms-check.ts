import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useSession } from '@/shared/infrastructure'
import { readConsents } from './api/fetchers'
import { runColdStartTermsCheck } from './cold-start-terms'
import { usePhoneAuth } from './stores'

const SIGNUP_TERMS_ROUTE = '/(app)/(stack)/signup-terms' as const

export const useColdStartTermsCheck = () => {
  const session = useSession((s) => s.session)
  const ranFor = useRef<string | null>(null)

  useEffect(() => {
    if (!session) return
    if (ranFor.current === session.user.id) return
    ranFor.current = session.user.id
    void runColdStartTermsCheck(session, readConsents, {
      hold: (held) => usePhoneAuth.getState().hold(held),
      route: () => router.push(SIGNUP_TERMS_ROUTE),
    })
  }, [session])
}
