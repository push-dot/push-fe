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
