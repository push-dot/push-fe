import { createApi, createClient } from '@push/api-client'
import { isMock, pushEnv } from './bridge'
import { mockFetch } from './mock'

export const api = createApi(
  createClient({
    baseUrl: pushEnv().apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
    getToken: () => pushEnv().token,
    fetch: isMock() ? mockFetch : undefined,
  }),
)
