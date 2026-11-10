import { ApiError, type Session } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { pathAfterAuth, takeReturnTo } from '../../shared/auth/return-path'
import { sessionStore } from '../../shared/auth/session'
import {
  EMAIL_TAKEN_EMPLOYER_COPY,
  EMAIL_TAKEN_PERSONAL_COPY,
  PASSWORD_LENGTH_COPY,
} from '../../shared/model/constants'
import { emailSignupInput, emailTakenCopy, passwordError } from '../../shared/model/login-providers'
import { Icon } from '../../shared/ui/icon'
import Toast from '../../shared/ui/toast'
import AccountTypeControl from './account-type-control'
import AuthCheck from './auth-check'
import AuthPasswordField from './auth-password-field'
import {
  EMAIL_LABEL,
  LOGIN_FAILED_COPY,
  LOGIN_SUBMIT_COPY,
  NAME_LABEL,
  PASSWORD_HINT,
  PASSWORD_LABEL,
  SIGNUP_EMPLOYER_TITLE,
  SIGNUP_HAS_ACCOUNT,
  SIGNUP_LEAD,
  SIGNUP_SUBMIT_COPY,
  TERM_VIEW,
  TERMS_COLLECTION_LINK,
  TERMS_LABEL,
  TERMS_PRIVACY_POLICY,
  TERMS_REQUIRED,
  TERMS_SERVICE_LINK,
} from './constants'
import { useOAuthStart } from './oauth-start'
import PhoneFlow from './phone-flow'
import VerifyMail from './verify-mail'
import { authEmailSignup } from '../../features/sign-up'
import { useVerifyResend } from './verify-resend'

// Personal accounts start with a phone number (owner ruling: email/password is employer only); a first social login
// arrives here with push-be's pendingToken to attach the number.
const SignupPage = () => {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const oauth = useOAuthStart()
  const [employer, setEmployer] = useState(params.get('accountType') === 'EMPLOYER')
  const pendingToken = (location.state as { pendingToken?: string } | null)?.pendingToken

  if (!employer) {
    return (
      <PhoneFlow
        pendingToken={pendingToken}
        onProvider={(provider) => void oauth.start(provider, 'PERSONAL')}
        onDone={(session: Session) => {
          sessionStore.save(session)
          navigate(pathAfterAuth(takeReturnTo(), session), { replace: true })
        }}
      />
    )
  }
  return (
    <EmployerSignup
      initialEmail={params.get('email') ?? ''}
      onPersonal={() => setEmployer(false)}
    />
  )
}

const EmployerSignup = ({
  initialEmail,
  onPersonal,
}: {
  initialEmail: string
  onPersonal: () => void
}) => {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taken, setTaken] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const resend = useVerifyResend(email)
  const emailTaken = error === EMAIL_TAKEN_PERSONAL_COPY || error === EMAIL_TAKEN_EMPLOYER_COPY
  const passwordInvalid = error === PASSWORD_LENGTH_COPY
  const blocked = !terms || taken

  const send = async () => {
    const invalid = passwordError(password)
    if (invalid) {
      setError(invalid)
      return
    }
    const input = emailSignupInput({ email, password, accountType: 'EMPLOYER', displayName, terms })
    if (!input) return
    setError(null)
    setPending(true)
    try {
      await authEmailSignup(input)
      setDone(true)
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'EMAIL_TAKEN') {
        setTaken(true)
        setError(emailTakenCopy(caught.details?.accountType))
        return
      }
      setError(LOGIN_FAILED_COPY)
    } finally {
      setPending(false)
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await send()
  }

  if (done) {
    return (
      <>
        <VerifyMail
          email={email}
          pending={resend.pending || resend.cooling}
          error={resend.error}
          onResend={() => void resend.send()}
          onEdit={() => {
            setDone(false)
            setError(null)
            setTaken(false)
          }}
        />
        <Toast message={resend.toast.message} tone={resend.toast.tone} />
      </>
    )
  }

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{SIGNUP_EMPLOYER_TITLE}</h1>
        <p>{SIGNUP_LEAD}</p>
      </header>
      <AccountTypeControl
        value="EMPLOYER"
        onChange={(next) => next === 'PERSONAL' && onPersonal()}
      />
      <form className="auth-stack" onSubmit={(event) => void submit(event)}>
        <label className="auth-block">
          <span className="auth-label">{NAME_LABEL}</span>
          <span className="auth-control">
            <input
              value={displayName}
              autoComplete="name"
              required
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </span>
        </label>
        <label className="auth-block">
          <span className="auth-label">{EMAIL_LABEL}</span>
          <span className={emailTaken ? 'auth-control err' : 'auth-control'}>
            <input
              type="email"
              value={email}
              autoComplete="email"
              required
              aria-invalid={emailTaken ? true : undefined}
              onChange={(event) => {
                setEmail(event.target.value)
                if (taken) {
                  setTaken(false)
                  setError(null)
                }
              }}
            />
            {emailTaken ? <Icon name="warn" size={20} className="auth-warn" /> : null}
          </span>
          {emailTaken ? (
            <span className="auth-error" role="alert">
              {error}
            </span>
          ) : null}
        </label>
        <AuthPasswordField
          label={PASSWORD_LABEL}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={PASSWORD_HINT}
          error={passwordInvalid ? error : null}
        />
        <div className="auth-consents">
          <AuthCheck checked={terms} onChange={setTerms}>
            <span>
              <span className="auth-check-title">
                {TERMS_LABEL}
                <span className="auth-req">{TERMS_REQUIRED}</span>
              </span>
            </span>
          </AuthCheck>
          <span className="auth-legal-links">
            <a href="/terms" target="_blank" rel="noreferrer">
              {TERMS_SERVICE_LINK}
            </a>
            <a href={TERM_VIEW.privacy} target="_blank" rel="noreferrer">
              {TERMS_COLLECTION_LINK}
            </a>
            <a href="/privacy" target="_blank" rel="noreferrer">
              {TERMS_PRIVACY_POLICY}
            </a>
          </span>
        </div>
        {error && !emailTaken && !passwordInvalid ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className={blocked ? 'auth-btn pri dis' : 'auth-btn pri'}
          disabled={blocked || pending}
        >
          {SIGNUP_SUBMIT_COPY}
        </button>
      </form>
      <p className="auth-foot">
        {SIGNUP_HAS_ACCOUNT} <Link to="/login?accountType=EMPLOYER">{LOGIN_SUBMIT_COPY}</Link>
      </p>
    </main>
  )
}

export default SignupPage
