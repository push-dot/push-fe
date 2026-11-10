export const SESSION_STORAGE_KEY = 'push-web-session'
export const RETURN_TO_KEY = 'push-return-to'
export const SIGNUP_RETURN_TO_KEY = 'push-signup-return-to'
export const VERIFY_LINK_MS = 24 * 60 * 60 * 1000
export const PKCE_VERIFIER_KEY = 'push-pkce-verifier'

export const AUTH_ENTRY_PATHS = ['/login', '/signup', '/auth/callback', '/auth/verify', '/auth/reset'] as const
