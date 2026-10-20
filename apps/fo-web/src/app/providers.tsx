import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { isMock } from '../bridge'
import { mockPersona, mockSession, setMockPersona } from '../mock'
import { sessionStore } from '../shared/auth/session'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

const bootstrapMockPersona = () => {
  if (typeof window === 'undefined') return
  setMockPersona(new URLSearchParams(window.location.search).get('as'))
  const persona = mockPersona()
  if (!isMock() || !persona || sessionStore.load()) return
  sessionStore.save(mockSession(persona))
}

bootstrapMockPersona()

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

export default Providers
