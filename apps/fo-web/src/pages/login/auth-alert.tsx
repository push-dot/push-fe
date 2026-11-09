import type { ReactNode } from 'react'

const AuthAlert = ({
  tone = 'red',
  title,
  detail,
  action,
}: {
  tone?: 'red' | 'orange'
  title: string
  detail: ReactNode
  action?: ReactNode
}) => (
  <div className={tone === 'orange' ? 'auth-alert orange' : 'auth-alert'} role="alert">
    <span className="auth-alert-mark" aria-hidden="true">
      !
    </span>
    <span className="auth-alert-copy">
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </span>
  </div>
)

export default AuthAlert
