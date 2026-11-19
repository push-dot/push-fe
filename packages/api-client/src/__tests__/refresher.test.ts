import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../errors'
import { createRefresher } from '../refresher'
import type { Session } from '../types'

const session = (accessToken: string) => ({ accessToken, refreshToken: 'r' }) as Session
const authFailure = (e: unknown) => e instanceof ApiError && e.status === 401

const setup = (refresh: (s: Session | null) => Promise<Session>, lock?: <T>(run: () => Promise<T>) => Promise<T>) => {
  let stored: Session | null = session('old')
  const clear = vi.fn(() => void (stored = null))
  const refresher = createRefresher({
    refresh,
    load: () => stored,
    save: (s) => void (stored = s),
    clear,
    isAuthFailure: authFailure,
    lock,
  })
  return { refresher, clear, get: () => stored, set: (s: Session | null) => (stored = s) }
}

describe('createRefresher', () => {
  it('clears the session only on an auth failure', async () => {
    const a = setup(async () => Promise.reject(new ApiError('x', 'TOKEN_EXPIRED', 401)))
    await expect(a.refresher()).resolves.toBe(false)
    expect(a.clear).toHaveBeenCalledTimes(1)
    for (const error of [new ApiError('down', 'HTTP_ERROR', 503), new ApiError('net', 'NETWORK_ERROR', 0)]) {
      const b = setup(async () => Promise.reject(error))
      await expect(b.refresher()).resolves.toBe(false)
      expect(b.clear).not.toHaveBeenCalled()
      expect(b.get()?.accessToken).toBe('old')
    }
  })

  it('shares one refresh between concurrent callers', async () => {
    const refresh = vi.fn(async () => session('new'))
    const { refresher, get } = setup(refresh)
    await expect(Promise.all([refresher(), refresher(), refresher()])).resolves.toEqual([true, true, true])
    expect(refresh).toHaveBeenCalledTimes(1)
    expect(get()?.accessToken).toBe('new')
  })

  it('skips the refresh when the stored token changed while waiting for the lock', async () => {
    const refresh = vi.fn(async () => session('mine'))
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    const t = setup(refresh, (run) => gate.then(run))
    const pending = t.refresher()
    t.set(session('other-tab'))
    release()
    await expect(pending).resolves.toBe(true)
    expect(refresh).not.toHaveBeenCalled()
    expect(t.get()?.accessToken).toBe('other-tab')
  })

  it('reports false when another tab signed out meanwhile', async () => {
    const refresh = vi.fn(async () => session('mine'))
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    const t = setup(refresh, (run) => gate.then(run))
    const pending = t.refresher()
    t.set(null)
    release()
    await expect(pending).resolves.toBe(false)
    expect(refresh).not.toHaveBeenCalled()
  })
})
