import { useEffect, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { completeGoogle } from '@/features/calendar'
import type { GoogleStatus } from '@/features/calendar'
import { ErrorState, Skeleton } from '@/shared/components'

const inflight = new Map<string, Promise<GoogleStatus>>()

const completeOnce = (code: string): Promise<GoogleStatus> => {
  const existing = inflight.get(code)
  if (existing) return existing
  const p = completeGoogle(code).finally(() => inflight.delete(code))
  inflight.set(code, p)
  return p
}

const GoogleCallbackPage = () => {
  const [params] = useSearchParams()
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const code = params.get('code')
    if (!code) return
    completeOnce(code)
      .then(() => setDone(true))
      .catch(() => setFailed(true))
  }, [params])

  if (done) return <Navigate to="/calendar" replace />
  if (failed) return <ErrorState onRetry={() => setFailed(false)} />
  return (
    <div className="canvas">
      <div className="center">
        <Skeleton />
      </div>
    </div>
  )
}

export default GoogleCallbackPage
