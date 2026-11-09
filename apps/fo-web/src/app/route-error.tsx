import { useEffect } from 'react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { isWebView } from '../shared/lib/bridge'
import { NOT_FOUND } from '../pages/not-found/constants'
import { Icon } from '../shared/ui/icon'
import { LOAD_FAIL, PageState } from '../shared/ui/page-state'

export const ErrorScreen = ({ onHome, onRetry }: { onHome?: () => void; onRetry: () => void }) => (
  <PageState
    top={
      <span className="state-tile big">
        <Icon name="warn" size={36} />
      </span>
    }
    title={LOAD_FAIL.title}
    body={LOAD_FAIL.body}
  >
    {onHome && (
      <button type="button" className="btn sec" onClick={onHome}>
        {LOAD_FAIL.home}
      </button>
    )}
    <button type="button" className="btn pri" onClick={onRetry}>
      <Icon name="retry" size={18} width={2.2} />
      {LOAD_FAIL.retry}
    </button>
  </PageState>
)

// The raw error stays in the console; the screen never shows its message or stack.
// The WebView has no home page to go back to, so it only offers retry.
export const RouteError = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  useEffect(() => console.error(error), [error])
  return (
    <ErrorScreen
      onHome={isWebView() ? undefined : () => navigate('/')}
      onRetry={() => window.location.reload()}
    />
  )
}

// The WebView has no home to land on, so the unknown-path screen only offers going back.
export const WebViewNotFound = () => {
  const navigate = useNavigate()
  return (
    <PageState
      top={<span className="nf-code num">404</span>}
      title={NOT_FOUND.title}
      body={NOT_FOUND.body}
    >
      <button type="button" className="btn pri" onClick={() => navigate(-1)}>
        {NOT_FOUND.back}
      </button>
    </PageState>
  )
}
