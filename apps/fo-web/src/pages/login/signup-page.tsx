import { ApiError, type AccountType } from '@push/api-client'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { emailTakenCopy, passwordError } from '../../shared/model/login-providers'
import AccountTypeControl from './account-type-control'
import {
  CONSENT_COPY,
  EMAIL_LABEL,
  LOGIN_FAILED_COPY,
  NAME_LABEL,
  PASSWORD_LABEL,
  SIGNUP_LINK_COPY,
  SIGNUP_SENT_COPY,
  SIGNUP_SUBMIT_COPY,
} from './constants'

const SignupPage = () => {
  const [params] = useSearchParams()
  const [accountType, setAccountType] = useState<AccountType>(
    params.get('accountType') === 'EMPLOYER' ? 'EMPLOYER' : 'PERSONAL',
  )
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = passwordError(password)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setPending(true)
    try {
      await api.auth.emailSignup({
        email,
        password,
        accountType,
        displayName,
        consentReference: consent,
      })
      setDone(true)
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === 'EMAIL_TAKEN') {
        setError(emailTakenCopy(caught.details?.accountType))
        return
      }
      setError(LOGIN_FAILED_COPY)
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <main className="auth">
        <p className="auth-note">{SIGNUP_SENT_COPY}</p>
      </main>
    )
  }

  return (
    <main className="auth">
      <h1 className="h2">{SIGNUP_LINK_COPY}</h1>
      <AccountTypeControl value={accountType} onChange={setAccountType} />
      <form onSubmit={(event) => void submit(event)}>
        <label className="field">
          <span>{NAME_LABEL}</span>
          <input
            value={displayName}
            autoComplete="name"
            required
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
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
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="check">
          <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
          <span>{CONSENT_COPY}</span>
        </label>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="primary" disabled={pending}>
          {SIGNUP_SUBMIT_COPY}
        </button>
      </form>
    </main>
  )
}

export default SignupPage
