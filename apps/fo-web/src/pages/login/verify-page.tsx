import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { LOGIN_FAILED_COPY, MISSING_VERIFY_COPY } from './constants'

const VerifyPage = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(token ? null : MISSING_VERIFY_COPY)
  const started = useRef(false)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    const run = async () => {
      try {
        const session = await api.auth.emailVerify(token)
        sessionStore.save(session)
        navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
      } catch {
        setMessage(LOGIN_FAILED_COPY)
      }
    }
    void run()
  }, [navigate, token])

  return <main className="auth">{message ? <p className="auth-error">{message}</p> : null}</main>
}

export default VerifyPage
