import { afterEach, describe, expect, it, vi } from 'vitest'

import { saveSignupReturnTo, takeSignupReturnTo } from './return-path'
import { createSessionStore } from './session'

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
    saveSignupReturnTo('/invites/tok', 'jiho.han@moapay.kr', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo('jiho.han@moapay.kr', DAY - 1)).toBe('/invites/tok')
    expect(takeSignupReturnTo('jiho.han@moapay.kr', DAY - 1)).toBe('/')
  })

  it('forgets it once the 24-hour verification link could no longer work', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('/invites/tok', 'jiho.han@moapay.kr', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo('jiho.han@moapay.kr', DAY + 1)).toBe('/')
  })

  it('never returns to an outside address', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('https://evil.example', 'jiho.han@moapay.kr', 0)
    expect(takeSignupReturnTo('jiho.han@moapay.kr', 1)).toBe('/')
  })

  it('sends another person who verifies on the same browser home, not to the saved invite', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('/invites/tok', 'Jiho.Han@moapay.kr', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo('mina.lee@moapay.kr', 1)).toBe('/')
    saveSignupReturnTo('/invites/tok', 'Jiho.Han@moapay.kr', 0)
    vi.stubGlobal('sessionStorage', memory())
    expect(takeSignupReturnTo('jiho.han@moapay.kr', 1)).toBe('/invites/tok')
  })

  it('drops the saved path when the browser signs out', () => {
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('sessionStorage', memory())
    saveSignupReturnTo('/invites/tok', 'jiho.han@moapay.kr', 0)
    vi.stubGlobal('sessionStorage', memory())
    createSessionStore(memory()).clear()
    expect(takeSignupReturnTo('jiho.han@moapay.kr', 1)).toBe('/')
  })
})
