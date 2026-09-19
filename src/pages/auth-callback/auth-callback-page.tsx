import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { exchangeCode } from '@/features/auth'
import { useSessionStore } from '@/shared/auth/session'
import type { Session } from '@/shared/auth/session'
import { ErrorState, Skeleton } from '@/shared/components'

const inflight = new Map<string, Promise<Session>>()

const exchangeOnce = (code: string): Promise<Session> => {
  const existing = inflight.get(code)
  if (existing) return existing
  const p = exchangeCode(code).finally(() => inflight.delete(code))
  inflight.set(code, p)
  return p
}

const AuthCallbackPage = () => {
  const [params] = useSearchParams()
  const session = useSessionStore((s) => s.session)
  const setSession = useSessionStore((s) => s.setSession)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const code = params.get('code')
    if (!code || session) return
    exchangeOnce(code)
      .then(setSession)
      .catch(() => setFailed(true))
  }, [params, session, setSession])

  if (session) return <Navigate to="/" replace />
  if (failed) return <ErrorState onRetry={() => setFailed(false)} />
  return (
    <div className="canvas">
      <div className="center">
        <Skeleton />
      </div>
    </div>
  )
}

export default AuthCallbackPage
