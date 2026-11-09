import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './icon'

export const LOAD_FAIL = {
  title: '페이지를 불러오지 못했어요',
  body: '인터넷 연결을 확인하고 다시 시도해 주세요.',
  home: '홈으로 가기',
  retry: '다시 시도',
} as const

export const PageState = ({ top, title, body, children }: { top: ReactNode; title: string; body: string; children: ReactNode }) => (
  <main className="page page-state">
    {top}
    <h1 className="h2">{title}</h1>
    <p className="b1 t3">{body}</p>
    <div className="state-actions">{children}</div>
  </main>
)

export const LoadFail = ({ onRetry }: { onRetry?: () => void }) => {
  const navigate = useNavigate()
  return (
    <PageState
      top={
        <span className="state-tile big">
          <Icon name="warn" size={36} />
        </span>
      }
      title={LOAD_FAIL.title}
      body={LOAD_FAIL.body}
    >
      <button type="button" className="btn sec" onClick={() => navigate('/')}>
        {LOAD_FAIL.home}
      </button>
      <button type="button" className="btn pri" onClick={onRetry ?? (() => window.location.reload())}>
        <Icon name="retry" size={18} width={2.2} />
        {LOAD_FAIL.retry}
      </button>
    </PageState>
  )
}
