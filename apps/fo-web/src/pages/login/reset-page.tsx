import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { passwordError } from '../../shared/model/login-providers'
import {
  EMAIL_LABEL,
  LOGIN_FAILED_COPY,
  NEW_PASSWORD_LABEL,
  PASSWORD_CHANGED_COPY,
  RESET_CONFIRM_COPY,
  RESET_SEND_COPY,
  RESET_SENT_COPY,
} from './constants'

const ResetPage = () => {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const requestReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    await api.auth.requestPasswordReset(email).catch(() => undefined)
    setNotice(RESET_SENT_COPY)
    setPending(false)
  }

  const confirmReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invalid = passwordError(password)
    if (invalid) {
      setError(invalid)
      return
    }
    if (!token) return
    setError(null)
    setPending(true)
    try {
      await api.auth.confirmPasswordReset(token, password)
      setNotice(PASSWORD_CHANGED_COPY)
    } catch {
      setError(LOGIN_FAILED_COPY)
    } finally {
      setPending(false)
    }
  }

  if (notice) {
    return (
      <main className="auth">
        <p className="auth-note">{notice}</p>
      </main>
    )
  }

  if (token) {
    return (
      <main className="auth">
        <h1 className="h2">{RESET_CONFIRM_COPY}</h1>
        <form onSubmit={(event) => void confirmReset(event)}>
          <label className="field">
            <span>{NEW_PASSWORD_LABEL}</span>
            <input
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="primary" disabled={pending}>
            {RESET_CONFIRM_COPY}
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="auth">
      <h1 className="h2">{RESET_CONFIRM_COPY}</h1>
      <form onSubmit={(event) => void requestReset(event)}>
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
    </main>
  )
}

export default ResetPage
