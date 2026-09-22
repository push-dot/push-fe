import { QueryClient } from '@tanstack/react-query'
import type { FetchQueryOptions } from '@tanstack/react-query'

export const LIST_STALE_TIME = 30_000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: LIST_STALE_TIME },
  },
})

export const prefetchList = (options: FetchQueryOptions) =>
  void queryClient.prefetchQuery(options)
