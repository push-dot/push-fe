import { ApiError, type AccountType, type Session } from '@push/api-client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import { loginProviders, type OAuthProvider } from '../../shared/model/login-providers'
import { GoogleMark } from '../../shared/ui/icon'
import AccountTypeControl from './account-type-control'
import AuthAlert from './auth-alert'
import AuthPasswordField from './auth-password-field'
import AuthProviderButton from './auth-provider-button'
import { authEmailLogin } from '../../features/sign-in'
import {
  BAD_CREDENTIALS_COPY,
  EMAIL_OR,
  EMPLOYER_EMAIL_LABEL,
  EMPLOYER_INVITE_NOTE,
  FORGOT_COPY,
  GOOGLE_CONTINUE,
  LOGIN_EMPLOYER_LEAD,
  LOGIN_EMPLOYER_TITLE,
  LOGIN_FAILED_COPY,
  LOGIN_PERSONAL_LEAD,
  LOGIN_PERSONAL_NOTE,
  LOGIN_PERSONAL_TITLE,
  LOGIN_SUBMIT_COPY,
  OTHER_METHOD,
  PASSWORD_LABEL,
  PROVIDER_NAME,
  SIGNUP_LINK_COPY,
  SOCIAL_FAIL_DETAIL,
  SOCIAL_FAIL_TAIL,
  UNVERIFIED_TAIL,
  UNVERIFIED_TITLE,
  VERIFY_MAIL_RESEND,
} from './constants'
import { useOAuthStart } from './oauth-start'
import PhoneFlow from './phone-flow'

export type LoginState = { failed?: OAuthProvider; detail?: string } | null

const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [accountType, setAccountType] = useState<AccountType>(
    params.get('accountType') === 'EMPLOYER' ? 'EMPLOYER' : 'PERSONAL',
  )
  const [phone, setPhone] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [unverified, setUnverified] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const oauth = useOAuthStart()
  const returned = (location.state as LoginState)?.failed ?? null
  const failed = oauth.failed ?? returned
  const redirected = useRef(false)
  const employer = accountType === 'EMPLOYER'

  useEffect(() => {
    if (redirected.current) return
    const current = sessionStore.load()
    if (!current) return
    redirected.current = true
    navigate(pathAfterAuth(takeReturnTo(), current), { replace: true })
  }, [navigate])

  const leave = (session: Session) => {
    sessionStore.save(session)
    navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
  }

  const clearNotes = () => {
    setError(null)
    setUnverified(null)
    oauth.clearFailed()
    if (returned) navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearNotes()
    setPending(true)
    try {
      leave(await authEmailLogin(email, password))
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'EMAIL_NOT_VERIFIED') setUnverified(email)
      else setError(caught instanceof ApiError && caught.status === 401 ? BAD_CREDENTIALS_COPY : LOGIN_FAILED_COPY)
    } finally {
      setPending(false)
    }
  }

  if (phone) {
    return (
      <PhoneFlow
        backLabel={OTHER_METHOD}
        onBack={() => setPhone(false)}
        onProvider={(provider) => void oauth.start(provider, 'PERSONAL')}
        onDone={leave}
      />
    )
  }

  const busy = pending || oauth.pending
  // push-be has no resend-only endpoint: a new verification mail comes from submitting the sign-up form again.
  const alert = failed ? (
    <AuthAlert
      title={`${PROVIDER_NAME[failed]}${SOCIAL_FAIL_TAIL}`}
      detail={(location.state as LoginState)?.detail ?? SOCIAL_FAIL_DETAIL}
    />
  ) : unverified ? (
    <AuthAlert
      tone="orange"
      title={UNVERIFIED_TITLE}
      detail={
        <>
          <b>{unverified}</b>
          {UNVERIFIED_TAIL}
        </>
      }
      action={
        <Link className="auth-btn line sm" to={`/signup?accountType=EMPLOYER&email=${encodeURIComponent(unverified)}`}>
          {VERIFY_MAIL_RESEND}
        </Link>
      }
    />
  ) : null

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{employer ? LOGIN_EMPLOYER_TITLE : LOGIN_PERSONAL_TITLE}</h1>
        <p>{employer ? LOGIN_EMPLOYER_LEAD : LOGIN_PERSONAL_LEAD}</p>
      </header>
      <AccountTypeControl
        value={accountType}
        onChange={(next) => {
          clearNotes()
          setAccountType(next)
        }}
      />
      {alert}
      {employer ? (
        <>
          <div className="auth-providers">
            <AuthProviderButton provider="google" disabled={busy} onClick={() => void oauth.start('google', 'EMPLOYER')}>
              <GoogleMark />
              {GOOGLE_CONTINUE}
            </AuthProviderButton>
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
                  placeholder={EMPLOYER_EMAIL_LABEL}
                  aria-label={EMPLOYER_EMAIL_LABEL}
                  required
                  onChange={(event) => setEmail(event.target.value)}
                />
              </span>
              <AuthPasswordField
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                placeholder={PASSWORD_LABEL}
                error={error}
              />
            </div>
            <button type="submit" className="auth-btn pri" disabled={busy}>
              {LOGIN_SUBMIT_COPY}
            </button>
          </form>
          <p className="auth-switch">
            <Link to="/signup?accountType=EMPLOYER">{SIGNUP_LINK_COPY}</Link>
            <span aria-hidden="true">·</span>
            {/* Board WebLoginBizWrongPw: after a wrong password the way out is as strong as sign-up. */}
            <Link className={error === BAD_CREDENTIALS_COPY ? undefined : 'quiet'} to="/auth/reset">
              {FORGOT_COPY}
            </Link>
          </p>
          {alert || error ? null : <p className="auth-aside">{EMPLOYER_INVITE_NOTE}</p>}
        </>
      ) : (
        <>
          <div className="auth-providers">
            {loginProviders('PERSONAL').map((provider) =>
              provider === 'email' ? null : (
                <AuthProviderButton
                  key={provider}
                  provider={provider}
                  disabled={busy}
                  onClick={() => {
                    if (provider === 'phone') {
                      clearNotes()
                      setPhone(true)
                    } else void oauth.start(provider, 'PERSONAL')
                  }}
                />
              ),
            )}
          </div>
          <p className="auth-note-line">{LOGIN_PERSONAL_NOTE}</p>
        </>
      )}
    </main>
  )
}

export default LoginPage
