import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import '@mantine/core/styles.css'
import '@push/design-system/styles'
import '@/theme/components.css'
import './app.css'
import { DesignSystemProvider } from '@push/design-system'
import { IconSprite } from '@/shared/components'
import { ErrorState } from '@/shared/components'
import { queryClient } from '@/shared/api'
import { initObservability, Sentry } from '@/shared/lib/observability'
import { configureChatInference } from '@/features/chat/lib/inference-bridge'
import { useInferenceSettings } from '@/features/inference/stores'
import { useSettingsStore } from '@/features/settings'
import { ROUTE_CONFIG } from './routes'

initObservability()

configureChatInference({
  aiOptions: () => useInferenceSettings.getState().aiOptions(),
  ensureModels: () => useInferenceSettings.getState().loadModels(),
  accessMode: () => useInferenceSettings.getState().accessMode,
  byokKey: () => useInferenceSettings.getState().byokKey,
})

const router = createBrowserRouter(ROUTE_CONFIG)

const handleDeepLink = (urls: string[]) => {
  for (const raw of urls) {
    if (!raw.startsWith('push://')) continue
    const url = new URL(raw.replace('push://', 'app://'))
    if (url.host === 'auth' && url.pathname === '/callback') {
      void router.navigate(`/auth/callback${url.search}`)
    }
  }
}

if ('__TAURI_INTERNALS__' in window) {
  void import('@tauri-apps/plugin-deep-link').then(({ getCurrent, onOpenUrl }) => {
    void getCurrent().then((urls) => urls && handleDeepLink(urls))
    void onOpenUrl(handleDeepLink)
  })
}

const App = () => {
  const theme = useSettingsStore((s) => s.theme)
  return (
    <Sentry.ErrorBoundary fallback={<ErrorState />}>
      <QueryClientProvider client={queryClient}>
        <DesignSystemProvider colorScheme={theme}>
          <IconSprite />
          <RouterProvider router={router} />
        </DesignSystemProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
