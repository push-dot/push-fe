import Button from './button'
import { useT } from '../i18n'
import { networkErrorMessage } from '../api/envelope'

type ErrorStateProps = {
  title?: string
  message?: string
  onRetry?: () => void
}

const ErrorState = ({ title, message, onRetry }: ErrorStateProps) => {
  const t = useT()
  return (
    <div className="error-state">
      <div className="t-h3">{title ?? t('common.loadFailed')}</div>
      <p className="t-body-sm">{message ?? networkErrorMessage()}</p>
      {onRetry ? (
        <Button variant="secondary" size="md" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      ) : null}
    </div>
  )
}

export default ErrorState
