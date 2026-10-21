import {
  VERIFY_MAIL_DONE,
  VERIFY_MAIL_MISSING,
  VERIFY_MAIL_OTHER,
  VERIFY_MAIL_RESEND,
  VERIFY_MAIL_SPAM,
  VERIFY_MAIL_TAIL,
  VERIFY_MAIL_TITLE,
} from './constants'

const VerifyMail = ({
  email,
  pending,
  error,
  onResend,
  onEdit,
}: {
  email: string
  pending: boolean
  error: string | null
  onResend: () => void
  onEdit: () => void
}) => (
  <main className="auth-card">
    <div className="auth-center">
      <span className="auth-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 7 9-7" />
        </svg>
      </span>
      <h1>{VERIFY_MAIL_TITLE}</h1>
      <p className="auth-mail-copy">
        <b>{email}</b>
        {VERIFY_MAIL_TAIL}
        <br />
        {VERIFY_MAIL_DONE}
      </p>
    </div>
    <div className="auth-note-card">
      <strong>{VERIFY_MAIL_MISSING}</strong>
      <span>{VERIFY_MAIL_SPAM}</span>
    </div>
    {error ? (
      <p className="auth-error" role="alert">
        {error}
      </p>
    ) : null}
    <button type="button" className="auth-btn sec" disabled={pending} onClick={onResend}>
      {VERIFY_MAIL_RESEND}
    </button>
    <button type="button" className="auth-text" onClick={onEdit}>
      {VERIFY_MAIL_OTHER}
    </button>
  </main>
)

export default VerifyMail
