import { describe, expect, it } from 'vitest'
import { clockOf, formatPhone, linkedProvider, toE164, validPhone } from './phone'

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
