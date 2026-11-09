import type { OAuthProvider } from '../../shared/model/login-providers'

export const phoneDigits = (value: string) => value.replace(/\D/g, '').slice(0, 11)

export const formatPhone = (value: string) => {
  const digits = phoneDigits(value)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

export const validPhone = (value: string) => /^01\d{8,9}$/.test(phoneDigits(value))

export const toE164 = (value: string) => `+82${phoneDigits(value).slice(1)}`

export const codeDigits = (value: string) => value.replace(/\D/g, '').slice(0, 6)

export const clockOf = (ms: number) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

const OAUTH: readonly OAuthProvider[] = ['google', 'apple', 'github']

export const linkedProvider = (value: unknown): OAuthProvider | null =>
  OAUTH.find((provider) => provider === value) ?? null

export type PhoneFailure =
  | { kind: 'wrong' }
  | { kind: 'expired' }
  | { kind: 'limit'; maxAttempts: number }
  | { kind: 'taken'; provider: OAuthProvider | null }
  | { kind: 'failed' }

type ErrorLike = { code?: string; details?: Record<string, unknown> | null }

// push-be codes for POST auth/phone/verify. PHONE_TAKEN never names the owner's provider, so only PHONE_ALREADY_REGISTERED offers a login button.
export const phoneFailure = (caught: unknown): PhoneFailure => {
  const { code, details } = (caught ?? {}) as ErrorLike
  if (code === 'PHONE_CODE_INVALID') return { kind: 'wrong' }
  if (code === 'PHONE_CODE_EXPIRED') return { kind: 'expired' }
  if (code === 'RATE_LIMITED' && details?.reason === 'TOO_MANY_ATTEMPTS') {
    return { kind: 'limit', maxAttempts: typeof details.maxAttempts === 'number' ? details.maxAttempts : 5 }
  }
  if (code === 'PHONE_ALREADY_REGISTERED') {
    const providers = Array.isArray(details?.existingProviders) ? details.existingProviders : []
    return { kind: 'taken', provider: providers.map(linkedProvider).find(Boolean) ?? null }
  }
  if (code === 'PHONE_TAKEN') return { kind: 'taken', provider: null }
  return { kind: 'failed' }
}
