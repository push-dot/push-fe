import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { openUrl } from '@tauri-apps/plugin-opener'
import { startOAuth } from '@/features/auth'
import { AuthProvider } from '@/features/auth'
import { useSessionStore } from '@/shared/auth/session'
import { useT } from '@/shared/i18n'
import { Button, Card, ErrorState } from '@/shared/components'

const LoginPage = () => {
  const t = useT()
  const session = useSessionStore((s) => s.session)
  const [pending, setPending] = useState<AuthProvider | null>(null)
  const [failed, setFailed] = useState(false)

  if (session) return <Navigate to="/" replace />

  const start = async (provider: AuthProvider) => {
    setPending(provider)
    setFailed(false)
    try {
      const { authorizationUrl } = await startOAuth(provider)
      if ('__TAURI_INTERNALS__' in window) {
        await openUrl(authorizationUrl)
      } else {
        window.location.assign(authorizationUrl)
      }
    } catch {
      setFailed(true)
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="canvas">
      <div className="center">
        <Card title="Push">
          <p className="t-body-sm">{t('app.tagline')}</p>
        </Card>
        {failed ? (
          <ErrorState onRetry={() => setFailed(false)} />
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              loading={pending === 'google'}
              onClick={() => void start('google')}
            >
              {t('login.google')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              loading={pending === 'github'}
              onClick={() => void start('github')}
            >
              {t('login.github')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default LoginPage
