import type { ReactNode } from 'react'

import type { LoginProvider } from '../../shared/model/login-providers'
import { AppleMark, GithubMark, GoogleMark, Icon } from '../../shared/ui/icon'
import { PROVIDER_START_LABEL } from './constants'

type ButtonProvider = Exclude<LoginProvider, 'email'>

export const ProviderMark = ({ provider }: { provider: ButtonProvider }) => {
  if (provider === 'google') return <GoogleMark />
  if (provider === 'apple') return <AppleMark />
  if (provider === 'github') return <GithubMark />
  return <Icon name="phone" size={22} />
}

// The board lines every personal start button up on one 216 px icon column; employer and invite buttons centre a plain label.
const AuthProviderButton = ({
  provider,
  disabled,
  onClick,
  children,
}: {
  provider: ButtonProvider
  disabled?: boolean
  onClick: () => void
  children?: ReactNode
}) => (
  <button
    type="button"
    className={provider === 'apple' ? 'auth-btn ink' : 'auth-btn line'}
    disabled={disabled}
    onClick={onClick}
  >
    {children ?? (
      <span className="auth-btn-col">
        <ProviderMark provider={provider} />
        {PROVIDER_START_LABEL[provider]}
      </span>
    )}
  </button>
)

export default AuthProviderButton
