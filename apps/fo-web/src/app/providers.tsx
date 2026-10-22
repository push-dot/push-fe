import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { sessionStore } from '../shared/auth/session'
import { applyMockSearch } from './mock-bootstrap'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

if (typeof window !== 'undefined') applyMockSearch(window.location.search, sessionStore)

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

export default Providers
