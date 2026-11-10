import type { ReactNode } from 'react'
import { Icon } from '../../shared/ui/icon'

const AuthCheck = ({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) => (
  <label className="auth-check">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span className={checked ? 'auth-tick on' : 'auth-tick'} aria-hidden="true">
      {checked ? <Icon name="check" size={14} /> : null}
    </span>
    {children}
  </label>
)

export default AuthCheck
