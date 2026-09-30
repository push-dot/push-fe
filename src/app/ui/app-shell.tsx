import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/shared/auth/session'
import { ToastHost } from '@/shared/components'
import { useInferenceSettings } from '@/features/inference'
import { useBilling } from '@/features/billing'
import { applyTheme, useSettingsStore } from '@/features/settings'
import Sidebar from './sidebar'

const AppShell = () => {
  const session = useSessionStore((s) => s.session)
  const loadModels = useInferenceSettings((s) => s.loadModels)
  const setPlan = useInferenceSettings((s) => s.setPlan)
  const { data: billing } = useBilling()

  useEffect(() => {
    applyTheme(useSettingsStore.getState().theme)
    void loadModels()
  }, [loadModels])

  useEffect(() => {
    setPlan(billing?.plan ?? null)
  }, [billing, setPlan])

  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="canvas">
        <Outlet />
      </main>
      <ToastHost />
    </div>
  )
}

export default AppShell
