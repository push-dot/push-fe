import { absoluteUrl, createApi, createClient, type Session } from '@push/api-client'
import { isMock, isWebView, pushEnv } from './bridge'
import { mockFetch } from './mock'
import { readAccessToken, sessionStore } from './shared/auth/session'
import { accessToken } from './shared/auth/token-source'

export const apiBaseUrl =
  pushEnv().apiBaseUrl ?? import.meta.env.VITE_API_BASE_URL ?? 'https://push-be.youngjoon568.workers.dev/api/v1'
const mockTransport = isMock()

export const assetUrl = (url: string | null | undefined) => absoluteUrl(url, apiBaseUrl) ?? undefined

let refreshInFlight: Promise<boolean> | null = null

const refreshOnce = async () => {
  const current = sessionStore.load()
  if (!current?.refreshToken) {
    sessionStore.clear()
    return false
  }
  try {
    const transport = mockTransport ? mockFetch : fetch
    const response = await transport(`${apiBaseUrl.replace(/\/+$/, '')}/auth/refresh`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    })
    if (!response.ok) {
      sessionStore.clear()
      return false
    }
    const body = (await response.json()) as { data?: Session }
    if (!body.data?.accessToken) {
      sessionStore.clear()
      return false
    }
    sessionStore.save(body.data)
    return true
  } catch {
    sessionStore.clear()
    return false
  }
}

const refreshSession = () => {
  if (isWebView()) return Promise.resolve(false)
  refreshInFlight ??= refreshOnce().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

export const api = createApi(
  createClient({
    baseUrl: apiBaseUrl,
    getToken: () => accessToken({ webView: isWebView(), injected: pushEnv().token, session: readAccessToken() }),
    refresh: refreshSession,
    fetch: mockTransport ? mockFetch : undefined,
  }),
)
