type PushEnv = { token?: string | null; apiBaseUrl?: string; mock?: boolean }

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

let mockLatched = false

export const isMock = () => {
  if (mockLatched) return true
  if (typeof window === 'undefined') return false
  mockLatched = !!pushEnv().mock || new URLSearchParams(location.search).has('mock')
  return mockLatched
}

if (typeof window !== 'undefined') {
  window.addEventListener('push:token', (e) => {
    pushEnv().token = (e as CustomEvent<{ token?: string | null }>).detail?.token
  })
}

export const send = (message: BridgeMessage) => {
  if (message.type === 'title') document.title = message.title
  if (window.ReactNativeWebView) return window.ReactNativeWebView.postMessage(JSON.stringify(message))
  if (message.type === 'external') window.open(message.url, '_blank', 'noopener')
}
