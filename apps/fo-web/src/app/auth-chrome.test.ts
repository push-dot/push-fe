import { describe, expect, it } from 'vitest'
import { isAuthChrome } from './auth-chrome'

describe('isAuthChrome', () => {
  it('uses the sparse header on auth routes only', () => {
    expect(isAuthChrome('/login')).toBe(true)
    expect(isAuthChrome('/signup')).toBe(true)
    expect(isAuthChrome('/auth/verify')).toBe(true)
    expect(isAuthChrome('/auth/reset')).toBe(true)
    expect(isAuthChrome('/employer/verify')).toBe(true)
    expect(isAuthChrome('/invites/tok')).toBe(true)
    expect(isAuthChrome('/invites')).toBe(false)
    expect(isAuthChrome('/')).toBe(false)
    expect(isAuthChrome('/jobs')).toBe(false)
    expect(isAuthChrome('/auth/callback')).toBe(false)
    expect(isAuthChrome('/employer/postings')).toBe(false)
  })
})
