import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { companiesAcceptInvite } from '../../features/accept-invite'
import {
  INVITE_ACCEPT_FAILED,
  INVITE_CAN,
  INVITE_EMAIL_ACCEPT,
  INVITE_GOOGLE,
  INVITE_LEAD,
  INVITE_LIMIT,
  INVITE_PERKS,
  INVITE_TITLE,
} from './constants'

const InvitePage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)

  const accept = async () => {
    if (!token || pending) return
    setFailed(false)
    setPending(true)
    try {
      await companiesAcceptInvite(token)
      navigate('/')
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  if (!token) {
    return (
      <main className="auth-card">
        <p className="auth-error" role="alert">
          {INVITE_ACCEPT_FAILED}
        </p>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <div className="auth-center">
        <span className="auth-invite-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M4 18V8l8-4 8 4v10" />
            <path d="M9 18v-5h6v5" />
          </svg>
        </span>
        <h1>{INVITE_TITLE}</h1>
        <p className="auth-mail-copy">{INVITE_LEAD}</p>
      </div>
      <div className="auth-perks">
        <strong>{INVITE_CAN}</strong>
        <ul>
          {INVITE_PERKS.map((perk) => (
            <li key={perk}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12l5 5L20 7" />
              </svg>
              {perk}
            </li>
          ))}
        </ul>
      </div>
      {failed ? (
        <p className="auth-error" role="alert">
          {INVITE_ACCEPT_FAILED}
        </p>
      ) : null}
      <div className="auth-stack tight">
        <button type="button" className="auth-btn line" disabled={pending} onClick={() => void accept()}>
          <span className="auth-google" aria-hidden="true">
            <span />
          </span>
          {INVITE_GOOGLE}
        </button>
        <button type="button" className="auth-btn pri" disabled={pending} onClick={() => void accept()}>
          {INVITE_EMAIL_ACCEPT}
        </button>
      </div>
      <p className="auth-hint center">{INVITE_LIMIT}</p>
    </main>
  )
}

export default InvitePage
