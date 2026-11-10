import { describe, expect, it } from 'vitest'
import { clockOf, formatPhone, linkedProvider, phoneFailure, sendCooldown, toE164, validPhone } from './phone'

describe('phone number entry', () => {
  it('groups a Korean mobile number as it is typed', () => {
    expect(formatPhone('010')).toBe('010')
    expect(formatPhone('0101234')).toBe('010-1234')
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
    expect(formatPhone('0111234567')).toBe('011-123-4567')
    expect(formatPhone('010-1234-56789')).toBe('010-1234-5678')
  })

  it('accepts only complete 01x numbers and sends them as E.164', () => {
    expect(validPhone('010-1234-5678')).toBe(true)
    expect(validPhone('010-1234-567')).toBe(true)
    expect(validPhone('02-123-4567')).toBe(false)
    expect(validPhone('010-123')).toBe(false)
    expect(toE164('010-1234-5678')).toBe('+821012345678')
  })
})

describe('code timers', () => {
  it('shows minutes and seconds, rounding up and never below zero', () => {
    expect(clockOf(168_000)).toBe('2:48')
    expect(clockOf(150_200)).toBe('2:31')
    expect(clockOf(0)).toBe('0:00')
    expect(clockOf(-5_000)).toBe('0:00')
  })
})

describe('linkedProvider', () => {
  it('names only the social providers a phone can be linked to', () => {
    expect(linkedProvider('google')).toBe('google')
    expect(linkedProvider('apple')).toBe('apple')
    expect(linkedProvider('email')).toBeNull()
    expect(linkedProvider(undefined)).toBeNull()
  })
})

describe('phoneFailure', () => {
  const error = (code: string, details?: Record<string, unknown>) => ({ code, details })

  it('reads the push-be verify codes', () => {
    expect(phoneFailure(error('PHONE_CODE_INVALID', { attemptsLeft: 4 }))).toEqual({ kind: 'wrong' })
    expect(phoneFailure(error('PHONE_CODE_EXPIRED'))).toEqual({ kind: 'expired' })
    expect(phoneFailure(error('RATE_LIMITED', { reason: 'TOO_MANY_ATTEMPTS', maxAttempts: 5 }))).toEqual({ kind: 'limit', maxAttempts: 5 })
  })

  it('names the linked social provider only for PHONE_ALREADY_REGISTERED', () => {
    expect(phoneFailure(error('PHONE_ALREADY_REGISTERED', { existingProviders: ['phone', 'google'] }))).toEqual({ kind: 'taken', provider: 'google' })
    expect(phoneFailure(error('PHONE_TAKEN', { conflict: 'PHONE', provider: 'phone' }))).toEqual({ kind: 'taken', provider: null })
  })

  it('treats a send cooldown 429 and anything else as a plain failure', () => {
    expect(phoneFailure(error('RATE_LIMITED', { retryAfterSec: 60 }))).toEqual({ kind: 'failed' })
    expect(phoneFailure(new Error('network'))).toEqual({ kind: 'failed' })
    expect(phoneFailure(undefined)).toEqual({ kind: 'failed' })
  })
})

describe('send cooldown', () => {
  it('reads the wait push-be gives with a send refused for this number', () => {
    expect(sendCooldown({ code: 'RATE_LIMITED', details: { retryAfterSec: 40 } })).toBe(40)
  })

  it('has no wait for other refusals, so the page says to try later instead', () => {
    expect(sendCooldown({ code: 'RATE_LIMITED' })).toBeNull()
    expect(sendCooldown({ code: 'RATE_LIMITED', details: { retryAfterSec: 0 } })).toBeNull()
    expect(sendCooldown({ code: 'NOT_CONFIGURED' })).toBeNull()
    expect(sendCooldown(new Error('offline'))).toBeNull()
  })
})
