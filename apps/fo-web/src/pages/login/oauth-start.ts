import type { AccountType } from '@push/api-client'
import { useState } from 'react'

import { authStart } from '../../features/sign-in'
import { createPkce, savePkceVerifier } from '../../shared/auth/pkce'
import type { OAuthProvider } from '../../shared/model/login-providers'
import { savePendingLogin } from './pending-login'

const CALLBACK_PATH = '/auth/callback'

// One PKCE start for every page that offers a social button; the mock answers start like push-be, so there is no mock branch.
export const useOAuthStart = () => {
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState<OAuthProvider | null>(null)

  const start = async (provider: OAuthProvider, accountType: AccountType) => {
    setFailed(null)
    setPending(true)
    try {
      const { verifier, challenge } = await createPkce()
      savePkceVerifier(verifier)
      savePendingLogin({ provider, accountType })
      const started = await authStart(provider, {
        codeChallenge: challenge,
        redirectUri: `${window.location.origin}${CALLBACK_PATH}`,
        accountType,
      })
      window.location.assign(started.authorizationUrl)
    } catch {
      setFailed(provider)
      setPending(false)
    }
  }

  return { start, pending, failed, clearFailed: () => setFailed(null) }
}
