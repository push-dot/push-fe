import { Link } from 'react-router-dom'

import { Icon } from '../../shared/ui/icon'

const AuthBack = ({ label, to, onClick }: { label: string; to?: string; onClick?: () => void }) => {
  const mark = <Icon name="back" size={18} />
  if (to) {
    return (
      <Link className="auth-back" to={to}>
        {mark}
        {label}
      </Link>
    )
  }
  return (
    <button type="button" className="auth-back" onClick={onClick}>
      {mark}
      {label}
    </button>
  )
}

export default AuthBack
