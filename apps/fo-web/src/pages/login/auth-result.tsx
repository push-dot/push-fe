import type { ReactNode } from 'react'
import { Icon, type IconName } from '../../shared/ui/icon'

export type ResultTone = 'ac' | 'green' | 'grey' | 'red'

const AuthResult = ({
  icon,
  tone,
  title,
  children,
}: {
  icon: IconName
  tone: ResultTone
  title: string
  children: ReactNode
}) => (
  <div className="auth-center">
    <span className={`auth-icon ${tone}`} aria-hidden="true">
      <Icon name={icon} size={38} />
    </span>
    <h1>{title}</h1>
    <p className="auth-mail-copy">{children}</p>
  </div>
)

export default AuthResult
