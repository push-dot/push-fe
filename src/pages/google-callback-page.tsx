import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { googleStateMatches, useCompleteGoogle } from '@/features/calendar'
import type { GoogleStatus } from '@/features/calendar'
import { ErrorState, Skeleton } from '@/shared/components'

const inflight = new Map<string, Promise<GoogleStatus>>()

const completeOnce = (
  code: string,
  complete: (code: string) => Promise<GoogleStatus>,
): Promise<GoogleStatus> => {
  const existing = inflight.get(code)
  if (existing) return existing
  const p = complete(code).finally(() => inflight.delete(code))
  inflight.set(code, p)
  return p
}

const GoogleCallbackPage = () => {
  const [params] = useSearchParams()
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const complete = useCompleteGoogle()
  const code = params.get('code')
  const stateOk = googleStateMatches(params.get('state'))

  useEffect(() => {
    if (!code || !stateOk) return
    completeOnce(code, complete.mutateAsync)
      .then(() => setDone(true))
      .catch(() => setFailed(true))
  }, [code, stateOk, complete.mutateAsync, attempt])

  if (done) return <Navigate to="/calendar" replace />
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

export default GoogleCallbackPage
