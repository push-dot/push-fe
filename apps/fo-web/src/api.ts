import { absoluteUrl, createApi, createClient } from '@push/api-client'
import { isMock, pushEnv } from './bridge'
import { mockFetch } from './mock'

const baseUrl = pushEnv().apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'https://push-be.youngjoon568.workers.dev/api/v1'

/** push-be image URLs are relative to the API origin, not this page's. */
export const assetUrl = (url: string | null | undefined) => absoluteUrl(url, baseUrl) ?? undefined

export const api = createApi(
  createClient({
    baseUrl,
    getToken: () => pushEnv().token,
    fetch: isMock() ? mockFetch : undefined,
  }),
)
