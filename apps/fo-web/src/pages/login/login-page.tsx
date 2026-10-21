import { ApiError, type AccountType } from '@push/api-client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { isMock } from '../../bridge'
import { mockSession } from '../../mock'
import { createPkce, savePkceVerifier } from '../../shared/auth/pkce'
import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { loginProviders } from '../../shared/model/login-providers'
import AccountTypeControl from './account-type-control'
import AuthPasswordField from './auth-password-field'
import AuthProviderButton from './auth-provider-button'
import {
  BAD_CREDENTIALS_COPY,
  EMAIL_LABEL,
  EMAIL_OR,
  EMPLOYER_EMAIL_LABEL,
  EMPLOYER_INVITE_NOTE,
  FORGOT_COPY,
  LOGIN_EMPLOYER_LEAD,
  LOGIN_EMPLOYER_TITLE,
  LOGIN_FAILED_COPY,
  LOGIN_PERSONAL_LEAD,
  LOGIN_PERSONAL_TITLE,
  LOGIN_SUBMIT_COPY,
  PASSWORD_LABEL,
  SIGNUP_LINK_COPY,
  VERIFY_MAIL_COPY,
} from './constants'

const CALLBACK_PATH = '/auth/callback'

const LoginPage = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [accountType, setAccountType] = useState<AccountType>(
    params.get('accountType') === 'EMPLOYER' ? 'EMPLOYER' : 'PERSONAL',
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const redirected = useRef(false)
  const employer = accountType === 'EMPLOYER'

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

  const continueWith = async (provider: 'google' | 'github') => {
    setError(null)
    if (isMock()) {
      const session = mockSession(employer ? 'employer' : 'personal')
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

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{employer ? LOGIN_EMPLOYER_TITLE : LOGIN_PERSONAL_TITLE}</h1>
        <p>{employer ? LOGIN_EMPLOYER_LEAD : LOGIN_PERSONAL_LEAD}</p>
      </header>
      <AccountTypeControl value={accountType} onChange={setAccountType} />
      <div className="auth-providers">
        {loginProviders(accountType).map((provider) =>
          provider === 'email' ? null : (
            <AuthProviderButton
              key={provider}
              provider={provider}
              disabled={pending}
              onClick={() => void continueWith(provider)}
            />
          ),
        )}
      </div>
      <div className="auth-or">
        <span className="auth-rule" />
        {EMAIL_OR}
        <span className="auth-rule" />
      </div>
      <form className="auth-stack" onSubmit={(event) => void submitLogin(event)}>
        <div className="auth-fields">
          <span className="auth-control">
            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder={employer ? EMPLOYER_EMAIL_LABEL : EMAIL_LABEL}
              aria-label={employer ? EMPLOYER_EMAIL_LABEL : EMAIL_LABEL}
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </span>
          <AuthPasswordField
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder={PASSWORD_LABEL}
          />
        </div>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="auth-btn pri" disabled={pending}>
          {LOGIN_SUBMIT_COPY}
        </button>
      </form>
      <p className="auth-switch">
        <Link to={`/signup?accountType=${accountType}`}>{SIGNUP_LINK_COPY}</Link>
        <span>·</span>
        <Link className="quiet" to="/auth/reset">
          {FORGOT_COPY}
        </Link>
      </p>
      {employer ? <p className="auth-aside">{EMPLOYER_INVITE_NOTE}</p> : null}
    </main>
  )
}

export default LoginPage
