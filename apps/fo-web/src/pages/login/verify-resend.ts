import { ApiError } from '@push/api-client'
import { useEffect, useState } from 'react'

import { authEmailResendVerify } from '../../features/verify-email'
import { useToast } from '../../shared/ui/toast'
import {
  VERIFY_RESEND_COOLDOWN_MS,
  VERIFY_RESEND_FAILED,
  VERIFY_RESEND_LATER,
  VERIFY_RESEND_SENT,
} from './constants'

export type VerifyResendResult = { toast: string | null; error: string | null; cooldownMs: number }

// POST auth/email/verify/resend is 204 either way, and 429 when the shared mail bucket is full.
export const requestVerifyResend = async (
  email: string,
  send: (email: string) => Promise<void>,
): Promise<VerifyResendResult> => {
  try {
    await send(email)
    return { toast: VERIFY_RESEND_SENT, error: null, cooldownMs: VERIFY_RESEND_COOLDOWN_MS }
  } catch (caught) {
    if (caught instanceof ApiError && caught.status === 429) {
      return { toast: null, error: VERIFY_RESEND_LATER, cooldownMs: VERIFY_RESEND_COOLDOWN_MS }
    }
    return { toast: null, error: VERIFY_RESEND_FAILED, cooldownMs: 0 }
  }
}

export const resendCooling = (now: number, until: number) => now < until

export const useVerifyResend = (email: string) => {
  const toast = useToast()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [until, setUntil] = useState(0)
  const [now, setNow] = useState(0)

  useEffect(() => {
    if (!resendCooling(now, until)) return
    const timer = window.setTimeout(() => setNow(Date.now()), until - Date.now())
    return () => window.clearTimeout(timer)
  }, [now, until])

  const send = async () => {
    if (!email || pending || resendCooling(Date.now(), until)) return
    setPending(true)
    setError(null)
    const result = await requestVerifyResend(email, authEmailResendVerify)
    setPending(false)
    setError(result.error)
    if (result.toast) toast.show(result.toast)
    if (result.cooldownMs > 0) {
      const stamp = Date.now()
      setNow(stamp)
      setUntil(stamp + result.cooldownMs)
    }
  }

  return { pending, cooling: resendCooling(now, until), error, send, toast }
}
