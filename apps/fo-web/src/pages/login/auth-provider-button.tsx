import { GithubMark, GoogleMark } from '../../shared/ui/icon'
import { PROVIDER_LABEL } from './constants'

const AuthProviderButton = ({
  provider,
  disabled,
  onClick,
}: {
  provider: 'google' | 'github'
  disabled: boolean
  onClick: () => void
}) => (
  <button type="button" className="auth-btn line" disabled={disabled} onClick={onClick}>
    {provider === 'google' ? <GoogleMark /> : <GithubMark />}
    {PROVIDER_LABEL[provider]}
  </button>
)

export default AuthProviderButton
