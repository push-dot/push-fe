import { ApiError } from '@push/api-client'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { takePkceVerifier } from '../../shared/auth/pkce'
import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { emailTakenCopy } from '../../shared/model/login-providers'
import { LOGIN_FAILED_COPY, VERIFY_MAIL_COPY } from './constants'
import { authExchange } from '../../shared/api/operations'


const CallbackPage = () => {
  const [params] = useSearchParams()
  const code = params.get('code')
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(code ? null : LOGIN_FAILED_COPY)
  const started = useRef(false)

  useEffect(() => {
    if (!code || started.current) return
    started.current = true
    const verifier = takePkceVerifier()
    if (!verifier) {
      setMessage(LOGIN_FAILED_COPY)
      return
    }
    const run = async () => {
      try {
        const session = await authExchange({ code, codeVerifier: verifier })
        sessionStore.save(session)
        navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
      } catch (caught) {
        if (caught instanceof ApiError && caught.code === 'EMAIL_TAKEN') {
          setMessage(emailTakenCopy(caught.details?.accountType))
          return
        }
        if (caught instanceof ApiError && caught.code === 'EMAIL_NOT_VERIFIED') {
          setMessage(VERIFY_MAIL_COPY)
          return
        }
        setMessage(LOGIN_FAILED_COPY)
      }
    }
    void run()
  }, [code, navigate])

  return (
    <main className="auth-card">
      {message ? (
        <p className="auth-error" role="alert">
          {message}
        </p>
      ) : null}
    </main>
  )
}

export default CallbackPage
