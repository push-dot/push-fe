type PushEnv = { token?: string | null; apiBaseUrl?: string; mock?: boolean; theme?: 'light' | 'dark' }

export const themeOf = (value: unknown): 'light' | 'dark' | undefined => (value === 'light' || value === 'dark' ? value : undefined)

export const applyTheme = (value: unknown) => {
  const theme = themeOf(value)
  if (!theme || typeof document === 'undefined') return
  document.documentElement.dataset.theme = theme
}

export type BridgeMessage =
  | { type: 'title'; title: string }
  | { type: 'open'; path: string }
  | { type: 'error'; status: number }
  | { type: 'external'; url: string }

declare global {
  interface Window {
    __PUSH__?: PushEnv
    ReactNativeWebView?: { postMessage: (message: string) => void }
  }
}

export const pushEnv = (): PushEnv => {
  if (typeof window === 'undefined') return {}
  return (window.__PUSH__ ??= {})
}

export const isWebView = () => typeof window !== 'undefined' && !!window.ReactNativeWebView

export const mockBuild = import.meta.env.DEV || import.meta.env.VITE_PUSH_MOCK === '1'

let mockLatched = false

export const isMock = () => {
  if (!mockBuild) return false
  if (mockLatched) return true
  if (typeof window === 'undefined') return false
  mockLatched = !!pushEnv().mock || new URLSearchParams(location.search).has('mock')
  return mockLatched
}

if (typeof window !== 'undefined') {
  applyTheme(pushEnv().theme)
  window.addEventListener('push:token', (e) => {
    pushEnv().token = (e as CustomEvent<{ token?: string | null }>).detail?.token
  })
  window.addEventListener('push:theme', (e) => {
    applyTheme((e as CustomEvent<{ theme?: unknown }>).detail?.theme)
  })
}

export const send = (message: BridgeMessage) => {
  if (message.type === 'title') document.title = message.title
  if (window.ReactNativeWebView) return window.ReactNativeWebView.postMessage(JSON.stringify(message))
  if (message.type === 'external') window.open(message.url, '_blank', 'noopener')
}
