import { Icon } from '../../shared/ui/icon'

const AuthBack = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button type="button" className="auth-back" onClick={onClick}>
    <Icon name="back" size={18} />
    {label}
  </button>
)

export default AuthBack
