import { ApiError } from '@push/api-client'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { authMe } from '../../entities/session'
import { pathAfterAuth, takeSignupReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import AuthResult from './auth-result'
import {
  LOGIN_FAILED_COPY,
  MISSING_VERIFY_COPY,
  VERIFY_EXPIRED_NEXT,
  VERIFY_EXPIRED_TITLE,
  VERIFY_EXPIRED_TO,
  VERIFY_EXPIRED_WHY,
  VERIFY_MAIL_OTHER,
  VERIFY_MAIL_RESEND,
} from './constants'
import { authEmailVerify } from '../../features/verify-email'

const SIGNUP = '/signup?accountType=EMPLOYER'

const VerifyPage = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(token ? null : MISSING_VERIFY_COPY)
  const [expired, setExpired] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    const run = async () => {
      try {
        const session = await authEmailVerify(token)
        sessionStore.save(session)
        // The session carries no email; the saved return path is used only for the address it was saved for.
        const email = await authMe().then((me) => me.email, () => '')
        navigate(pathAfterAuth(takeSignupReturnTo(email), session), { replace: true })
      } catch (caught) {
        // 410 TOKEN_EXPIRED carries the sign-up email; a new link comes from sending the sign-up form again.
        if (caught instanceof ApiError && caught.code === 'TOKEN_EXPIRED') setExpired(String(caught.details?.email ?? ''))
        else setMessage(LOGIN_FAILED_COPY)
      }
    }
    void run()
  }, [navigate, token])

  if (expired !== null) {
    return (
      <main className="auth-card">
        <AuthResult icon="clock" tone="grey" title={VERIFY_EXPIRED_TITLE}>
          {VERIFY_EXPIRED_WHY}
          <br />
          {VERIFY_EXPIRED_NEXT}
        </AuthResult>
        {expired ? (
          <div className="auth-note-card tight">
            <span>{VERIFY_EXPIRED_TO}</span>
            <strong>{expired}</strong>
          </div>
        ) : null}
        <Link className="auth-btn pri" to={expired ? `${SIGNUP}&email=${encodeURIComponent(expired)}` : SIGNUP}>
          {VERIFY_MAIL_RESEND}
        </Link>
        <Link className="auth-text" to={SIGNUP}>
          {VERIFY_MAIL_OTHER}
        </Link>
      </main>
    )
  }

  return (
    <main className="auth-card" aria-busy={message ? undefined : true}>
      {message ? (
        <p className="auth-error" role="alert">
          {message}
        </p>
      ) : null}
    </main>
  )
}

export default VerifyPage
