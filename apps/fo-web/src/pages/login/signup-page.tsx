import { ApiError, type AccountType } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { EMAIL_TAKEN_EMPLOYER_COPY, EMAIL_TAKEN_PERSONAL_COPY, PASSWORD_LENGTH_COPY } from '../../shared/model/constants'
import { emailTakenCopy, passwordError } from '../../shared/model/login-providers'
import AccountTypeControl from './account-type-control'
import AuthPasswordField from './auth-password-field'
import {
  CONSENT_COPY,
  CONSENT_LABEL,
  CONSENT_MORE,
  CONSENT_OPTIONAL,
  EMAIL_LABEL,
  LOGIN_FAILED_COPY,
  LOGIN_SUBMIT_COPY,
  NAME_LABEL,
  PASSWORD_HINT,
  PASSWORD_LABEL,
  SIGNUP_EMPLOYER_TITLE,
  SIGNUP_HAS_ACCOUNT,
  SIGNUP_LEAD,
  SIGNUP_PERSONAL_TITLE,
  SIGNUP_SUBMIT_COPY,
  TERMS_DETAIL,
  TERMS_LABEL,
  TERMS_REQUIRED,
} from './constants'
import VerifyMail from './verify-mail'
import { authEmailSignup } from '../../features/sign-up'


const SignupPage = () => {
  const [params] = useSearchParams()
  const [accountType, setAccountType] = useState<AccountType>(
    params.get('accountType') === 'EMPLOYER' ? 'EMPLOYER' : 'PERSONAL',
  )
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [terms, setTerms] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [taken, setTaken] = useState(false)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const employer = accountType === 'EMPLOYER'
  const emailTaken = error === EMAIL_TAKEN_PERSONAL_COPY || error === EMAIL_TAKEN_EMPLOYER_COPY
  const passwordInvalid = error === PASSWORD_LENGTH_COPY
  const blocked = !terms || taken

  const send = async () => {
    const invalid = passwordError(password)
    if (invalid) {
      setError(invalid)
      return
    }
    if (!terms) return
    setError(null)
    setPending(true)
    try {
      await authEmailSignup({
        email,
        password,
        accountType,
        displayName,
        consentReference: consent,
      })
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
      <VerifyMail
        email={email}
        pending={pending}
        error={error}
        onResend={() => void send()}
        onEdit={() => {
          setDone(false)
          setError(null)
          setTaken(false)
        }}
      />
    )
  }

  return (
    <main className="auth-card">
      <header className="auth-lead">
        <h1>{employer ? SIGNUP_EMPLOYER_TITLE : SIGNUP_PERSONAL_TITLE}</h1>
        <p>{SIGNUP_LEAD}</p>
      </header>
      <AccountTypeControl value={accountType} onChange={setAccountType} />
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
              onChange={(event) => {
                setEmail(event.target.value)
                if (taken) {
                  setTaken(false)
                  setError(null)
                }
              }}
            />
            {emailTaken ? (
              <svg className="auth-warn" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l9 16H3z" />
                <path d="M12 10v4" />
                <path d="M12 16.5h.01" />
              </svg>
            ) : null}
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
          <label className="auth-check">
            <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
            <span className={terms ? 'auth-tick on' : 'auth-tick'} aria-hidden="true">
              {terms ? (
                <svg viewBox="0 0 24 24">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              ) : null}
            </span>
            <span>
              <span className="auth-check-title">
                {TERMS_LABEL}
                <span className="auth-req">{TERMS_REQUIRED}</span>
              </span>
              <span className="auth-check-detail">{TERMS_DETAIL}</span>
            </span>
          </label>
          <label className="auth-check">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span className={consent ? 'auth-tick on' : 'auth-tick'} aria-hidden="true">
              {consent ? (
                <svg viewBox="0 0 24 24">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              ) : null}
            </span>
            <span>
              <span className="auth-check-title">
                {CONSENT_LABEL}
                <span className="auth-opt">{CONSENT_OPTIONAL}</span>
              </span>
              <span className="auth-check-detail">
                {CONSENT_COPY}. {CONSENT_MORE}
              </span>
            </span>
          </label>
        </div>
        {error && !emailTaken && !passwordInvalid ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className={blocked ? 'auth-btn pri dis' : 'auth-btn pri'} disabled={blocked || pending}>
          {SIGNUP_SUBMIT_COPY}
        </button>
      </form>
      <p className="auth-foot">
        {SIGNUP_HAS_ACCOUNT} <Link to={`/login?accountType=${accountType}`}>{LOGIN_SUBMIT_COPY}</Link>
      </p>
    </main>
  )
}

export default SignupPage
