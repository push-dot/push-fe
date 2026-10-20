import { ApiError, type AccountType } from '@push/api-client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { isMock } from '../../bridge'
import { mockSession } from '../../mock'
import { createPkce, savePkceVerifier } from '../../shared/auth/pkce'
import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { loginProviders, type LoginProvider } from '../../shared/model/login-providers'
import AccountTypeControl from './account-type-control'
import {
  BAD_CREDENTIALS_COPY,
  EMAIL_LABEL,
  FORGOT_COPY,
  LOGIN_FAILED_COPY,
  LOGIN_SUBMIT_COPY,
  PASSWORD_LABEL,
  PROVIDER_LABEL,
  RESET_SEND_COPY,
  RESET_SENT_COPY,
  SIGNUP_LINK_COPY,
  VERIFY_MAIL_COPY,
} from './constants'

const CALLBACK_PATH = '/auth/callback'

const LoginPage = () => {
  const navigate = useNavigate()
  const [accountType, setAccountType] = useState<AccountType>('PERSONAL')
  const [mode, setMode] = useState<'providers' | 'email' | 'reset'>('providers')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const redirected = useRef(false)

  useEffect(() => {
    if (redirected.current) return
    const current = sessionStore.load()
    if (!current) return
    redirected.current = true
    navigate(pathAfterAuth(takeReturnTo(), current), { replace: true })
  }, [navigate])

  const leave = (session: NonNullable<ReturnType<typeof sessionStore.load>>) => {
    navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
  }

  const continueWith = async (provider: LoginProvider) => {
    setError(null)
    if (provider === 'email') {
      setMode('email')
      return
    }
    if (isMock()) {
      const session = mockSession(accountType === 'EMPLOYER' ? 'employer' : 'personal')
      sessionStore.save(session)
      leave(session)
      return
    }
    setPending(true)
    try {
      const { verifier, challenge } = await createPkce()
      savePkceVerifier(verifier)
      const started = await api.auth.start(provider, {
        codeChallenge: challenge,
        redirectUri: `${window.location.origin}${CALLBACK_PATH}`,
        accountType,
      })
      window.location.assign(started.authorizationUrl)
    } catch {
      setError(LOGIN_FAILED_COPY)
      setPending(false)
    }
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setPending(true)
    try {
      const session = await api.auth.emailLogin(email, password)
      sessionStore.save(session)
      leave(session)
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError(BAD_CREDENTIALS_COPY)
        return
      }
      if (caught instanceof ApiError && caught.code === 'EMAIL_NOT_VERIFIED') {
        setError(VERIFY_MAIL_COPY)
        return
      }
      setError(LOGIN_FAILED_COPY)
    } finally {
      setPending(false)
    }
  }

  const submitReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    await api.auth.requestPasswordReset(email).catch(() => undefined)
    setNotice(RESET_SENT_COPY)
    setPending(false)
  }

  return (
    <main className="auth">
      <h1 className="h2">{LOGIN_SUBMIT_COPY}</h1>
      <AccountTypeControl value={accountType} onChange={setAccountType} />
      {notice ? <p className="auth-note">{notice}</p> : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      {mode === 'providers' ? (
        <div className="auth-actions">
          {loginProviders(accountType).map((provider) => (
            <button
              key={provider}
              type="button"
              className="provider"
              disabled={pending}
              onClick={() => void continueWith(provider)}
            >
              {PROVIDER_LABEL[provider]}
            </button>
          ))}
        </div>
      ) : null}
      {mode === 'email' ? (
        <form onSubmit={(event) => void submitLogin(event)}>
          <label className="field">
            <span>{EMAIL_LABEL}</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="field">
            <span>{PASSWORD_LABEL}</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button type="submit" className="primary" disabled={pending}>
            {LOGIN_SUBMIT_COPY}
          </button>
          <div className="auth-links">
            <Link to={`/signup?accountType=${accountType}`}>{SIGNUP_LINK_COPY}</Link>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                setMode('reset')
                setError(null)
              }}
            >
              {FORGOT_COPY}
            </button>
          </div>
        </form>
      ) : null}
      {mode === 'reset' && !notice ? (
        <form onSubmit={(event) => void submitReset(event)}>
          <label className="field">
            <span>{EMAIL_LABEL}</span>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button type="submit" className="primary" disabled={pending}>
            {RESET_SEND_COPY}
          </button>
        </form>
      ) : null}
    </main>
  )
}

export default LoginPage
