import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { passwordError } from '../../shared/model/login-providers'
import AuthBack from './auth-back'
import AuthPasswordField from './auth-password-field'
import AuthResult from './auth-result'
import { authConfirmPasswordReset, authPasswordResetEmail, authRequestPasswordReset } from '../../features/reset-password'
import {
  BACK_TO_LOGIN,
  CONFIRM_MISMATCH,
  CONFIRM_PASSWORD_LABEL,
  CONFIRM_PASSWORD_PLACEHOLDER,
  EMPLOYER_EMAIL_LABEL,
  LOGIN_FAILED_COPY,
  LOGIN_SUBMIT_COPY,
  NEW_PASSWORD_LABEL,
  NEW_PASSWORD_LEAD_TAIL,
  NEW_PASSWORD_TITLE,
  PASSWORD_CHANGED_ACTION,
  PASSWORD_CHANGED_COPY,
  PASSWORD_CHANGED_LOGIN,
  PASSWORD_CHANGED_SESSIONS,
  PASSWORD_HINT,
  RESET_CONFIRM_COPY,
  RESET_EXPIRED_NEXT,
  RESET_EXPIRED_TITLE,
  RESET_EXPIRED_WHY,
  RESET_GOOGLE_NOTE,
  RESET_INVALID_TITLE,
  RESET_INVALID_WHY,
  RESET_LEAD,
  RESET_LIMIT,
  RESET_NEW_LINK,
  RESET_RESEND,
  RESET_SEND_COPY,
  RESET_SENT_NEXT,
  RESET_SENT_TAIL,
  RESET_SEND_FAILED,
  RESET_SENT_TITLE,
  RESET_SPAM,
  RESET_TITLE,
  VERIFY_MAIL_MISSING,
} from './constants'
import { linkOutcome, requestOutcome } from './reset-outcome'

const EMPLOYER_LOGIN = '/login?accountType=EMPLOYER'

const EmailField = ({ email, onChange }: { email: string; onChange: (value: string) => void }) => (
  <label className="auth-block">
    <span className="auth-label">{EMPLOYER_EMAIL_LABEL}</span>
    <span className="auth-control">
      <input type="email" value={email} autoComplete="email" required onChange={(event) => onChange(event.target.value)} />
    </span>
  </label>
)

const FormError = ({ text }: { text?: string }) =>
  text ? (
    <p className="auth-error" role="alert">
      {text}
    </p>
  ) : null

const ResetPage = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [view, setView] = useState<'form' | 'sent' | 'done' | 'expired' | 'invalid'>('form')
  const [email, setEmail] = useState('')
  const [account, setAccount] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<{ field: 'password' | 'confirm' | 'form'; text: string } | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!token) return
    let live = true
    authPasswordResetEmail(token)
      .then((found) => live && setAccount(found.email))
      .catch((caught: unknown) => {
        const outcome = linkOutcome(caught)
        if (!live || outcome.view === 'form') return
        if (outcome.view === 'expired') setEmail(outcome.email)
        setView(outcome.view)
      })
    return () => {
      live = false
    }
  }, [token])

  const requestReset = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    setError(null)
    setPending(true)
    let caught: unknown = null
    try {
      // push-be answers 202 whether or not the email has an account, so the page never says which.
      await authRequestPasswordReset(email)
    } catch (failure) {
      caught = failure
    }
    const outcome = requestOutcome(caught)
    if (outcome === 'sent') setView('sent')
    else setError({ field: 'form', text: outcome === 'limit' ? RESET_LIMIT : RESET_SEND_FAILED })
    setPending(false)
  }

  const confirmReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = passwordError(password)
    if (invalid) {
      setError({ field: 'password', text: invalid })
      return
    }
    if (confirm !== password) {
      setError({ field: 'confirm', text: CONFIRM_MISMATCH })
      return
    }
    if (!token) return
    setError(null)
    setPending(true)
    try {
      await authConfirmPasswordReset(token, password)
      setView('done')
    } catch (caught) {
      const outcome = linkOutcome(caught)
      if (outcome.view === 'form') setError({ field: 'form', text: LOGIN_FAILED_COPY })
      else {
        if (outcome.view === 'expired') setEmail(outcome.email)
        setView(outcome.view)
      }
    } finally {
      setPending(false)
    }
  }

  if (view === 'sent') {
    return (
      <main className="auth-card">
        <AuthResult icon="mail" tone="ac" title={RESET_SENT_TITLE}>
          <b>{email}</b>
          {RESET_SENT_TAIL}
          <br />
          {RESET_SENT_NEXT}
        </AuthResult>
        <div className="auth-note-card">
          <strong>{VERIFY_MAIL_MISSING}</strong>
          <span>{RESET_SPAM}</span>
        </div>
        <FormError text={error?.text} />
        <button type="button" className="auth-btn sec" disabled={pending} onClick={() => void requestReset()}>
          {RESET_RESEND}
        </button>
        <Link className="auth-text" to={EMPLOYER_LOGIN}>
          {BACK_TO_LOGIN}
        </Link>
      </main>
    )
  }

  if (view === 'done') {
    return (
      <main className="auth-card">
        <AuthResult icon="check" tone="green" title={PASSWORD_CHANGED_COPY}>
          {PASSWORD_CHANGED_LOGIN}
          <br />
          {PASSWORD_CHANGED_SESSIONS}
        </AuthResult>
        <Link className="auth-btn pri" to={EMPLOYER_LOGIN}>
          {PASSWORD_CHANGED_ACTION}
        </Link>
      </main>
    )
  }

  if (view === 'expired' || view === 'invalid') {
    const expired = view === 'expired'
    return (
      <main className="auth-card">
        <AuthResult icon={expired ? 'clock' : 'link'} tone={expired ? 'grey' : 'red'} title={expired ? RESET_EXPIRED_TITLE : RESET_INVALID_TITLE}>
          {expired ? RESET_EXPIRED_WHY : RESET_INVALID_WHY}
          <br />
          {RESET_EXPIRED_NEXT}
        </AuthResult>
        <form className="auth-stack" onSubmit={(event) => void requestReset(event)}>
          <EmailField email={email} onChange={setEmail} />
          <FormError text={error?.text} />
          <button type="submit" className="auth-btn pri" disabled={pending}>
            {RESET_NEW_LINK}
          </button>
        </form>
        <Link className="auth-text" to={EMPLOYER_LOGIN}>
          {BACK_TO_LOGIN}
        </Link>
      </main>
    )
  }

  if (token) {
    return (
      <main className="auth-card">
        <header className="auth-lead">
          <h1>{NEW_PASSWORD_TITLE}</h1>
          {account ? (
            <p>
              <b>{account}</b>
              {NEW_PASSWORD_LEAD_TAIL}
            </p>
          ) : null}
        </header>
        <form className="auth-stack" noValidate onSubmit={(event) => void confirmReset(event)}>
          <AuthPasswordField
            label={NEW_PASSWORD_LABEL}
            value={password}
            onChange={(value) => {
              setPassword(value)
              if (error?.field === 'password') setError(null)
            }}
            autoComplete="new-password"
            hint={PASSWORD_HINT}
            error={error?.field === 'password' ? error.text : null}
          />
          <AuthPasswordField
            label={CONFIRM_PASSWORD_LABEL}
            value={confirm}
            onChange={(value) => {
              setConfirm(value)
              if (error?.field === 'confirm') setError(null)
            }}
            autoComplete="new-password"
            placeholder={CONFIRM_PASSWORD_PLACEHOLDER}
            error={error?.field === 'confirm' ? error.text : null}
          />
          <FormError text={error?.field === 'form' ? error.text : undefined} />
          <button type="submit" className={error && error.field !== 'form' ? 'auth-btn pri dis' : 'auth-btn pri'} disabled={pending}>
            {RESET_CONFIRM_COPY}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <AuthBack label={LOGIN_SUBMIT_COPY} to={EMPLOYER_LOGIN} />
      <header className="auth-lead">
        <h1>{RESET_TITLE}</h1>
        <p>{RESET_LEAD}</p>
      </header>
      <form className="auth-stack" onSubmit={(event) => void requestReset(event)}>
        <EmailField email={email} onChange={setEmail} />
        <FormError text={error?.text} />
        <button type="submit" className="auth-btn pri" disabled={pending}>
          {RESET_SEND_COPY}
        </button>
      </form>
      <p className="auth-aside">{RESET_GOOGLE_NOTE}</p>
    </main>
  )
}

export default ResetPage
