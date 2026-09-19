export const PKCE_VERIFIER_STORAGE_KEY = 'push:pkce-verifier'
export const OAUTH_REDIRECT_URI =
  '__TAURI_INTERNALS__' in window
    ? 'push://auth/callback'
    : `${window.location.origin}/auth/callback`
