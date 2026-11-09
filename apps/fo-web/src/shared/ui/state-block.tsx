import type { ReactNode } from 'react'
import { Icon, type IconName } from './icon'

type StateBlockProps = {
  icon: IconName
  title: string
  description?: string
  action?: ReactNode
  boxed?: boolean
  error?: boolean
}

const StateBlock = ({ icon, title, description, action, boxed = false, error = false }: StateBlockProps) => (
  <div className={['state', boxed ? 'box' : '', error ? 'err' : ''].filter(Boolean).join(' ')} role={error ? 'alert' : undefined}>
    <span className="state-tile">
      <Icon name={icon} size={28} width={boxed && !error ? 1.8 : 2} />
    </span>
    <p className="b1 w7">{title}</p>
    {description ? <p className="b2 t3">{description}</p> : null}
    {action ? <div className="state-actions">{action}</div> : null}
  </div>
)

export const ErrorState = ({ title, description, onRetry, retryLabel = '다시 시도', boxed }: { title: string; description?: string; onRetry?: () => void; retryLabel?: string; boxed?: boolean }) => (
  <StateBlock
    icon="warn"
    error
    boxed={boxed}
    title={title}
    description={description}
    action={
      onRetry ? (
        <button type="button" className="btn sec sm" onClick={onRetry}>
          <Icon name="retry" size={16} width={2.2} />
          {retryLabel}
        </button>
      ) : undefined
    }
  />
)

export default StateBlock
