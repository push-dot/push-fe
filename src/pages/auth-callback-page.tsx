import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { oauthStateMatches, useExchangeCode } from '@/features/auth'
import { useSessionStore } from '@/shared/auth/session'
import type { Session } from '@/shared/auth/session'
import { ErrorState, Skeleton } from '@/shared/components'

const inflight = new Map<string, Promise<Session>>()

const exchangeOnce = (
  code: string,
  exchange: (code: string) => Promise<Session>,
): Promise<Session> => {
  const existing = inflight.get(code)
  if (existing) return existing
  const p = exchange(code).finally(() => inflight.delete(code))
  inflight.set(code, p)
  return p
}

const AuthCallbackPage = () => {
  const [params] = useSearchParams()
  const session = useSessionStore((s) => s.session)
  const setSession = useSessionStore((s) => s.setSession)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const exchange = useExchangeCode()
  const code = params.get('code')
  const stateOk = oauthStateMatches(params.get('state'))

  useEffect(() => {
    if (!code || !stateOk || session) return
    exchangeOnce(code, exchange.mutateAsync)
      .then(setSession)
      .catch(() => setFailed(true))
  }, [code, stateOk, session, setSession, exchange.mutateAsync, attempt])

  if (session) return <Navigate to="/" replace />
  if (!code || !stateOk) return <ErrorState />
  if (failed) {
    return (
      <ErrorState
        onRetry={() => {
          setFailed(false)
          setAttempt((a) => a + 1)
        }}
      />
    )
  }
  return (
    <main className="canvas">
      <div className="center">
        <Skeleton />
      </div>
    </main>
  )
}

export default AuthCallbackPage
