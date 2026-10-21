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
    {provider === 'google' ? (
      <span className="auth-google" aria-hidden="true">
        <span />
      </span>
    ) : (
      <span className="auth-github" aria-hidden="true">
        GH
      </span>
    )}
    {PROVIDER_LABEL[provider]}
  </button>
)

export default AuthProviderButton
