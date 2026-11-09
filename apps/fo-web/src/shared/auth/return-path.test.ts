import { afterEach, describe, expect, it, vi } from 'vitest'

import { saveSignupReturnTo, takeSignupReturnTo } from './return-path'

const memory = () => {
  const items = new Map<string, string>()
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  }
}

const DAY = 24 * 60 * 60 * 1000

describe('sign-up return path', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('brings the verification link back to the invite even when the mail opens in a new tab', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('/invites/tok', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo(DAY - 1)).toBe('/invites/tok')
    expect(takeSignupReturnTo(DAY - 1)).toBe('/')
  })

  it('forgets it once the 24-hour verification link could no longer work', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('/invites/tok', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo(DAY + 1)).toBe('/')
  })

  it('never returns to an outside address', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('https://evil.example', 0)
    expect(takeSignupReturnTo(1)).toBe('/')
  })
})
