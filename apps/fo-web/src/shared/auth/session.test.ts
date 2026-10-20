import { describe, expect, it } from 'vitest'
import { createSessionStore, type StorageLike } from './session'

const memory = (): StorageLike => {
  const items = new Map<string, string>()
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value)
    },
    removeItem: (key) => {
      items.delete(key)
    },
  }
}

const sample = {
  accessToken: 'mock-access',
  refreshToken: 'mock-refresh',
  expiresIn: 900,
  user: {
    id: 'u1',
    displayName: '김서준',
    locale: 'ko',
    accountType: 'PERSONAL' as const,
    companyId: null,
    companyRole: null,
  },
}

describe('createSessionStore', () => {
  it('saves the session under push-web-session and loads it back', () => {
    const storage = memory()
    const store = createSessionStore(storage)
    store.save(sample)
    expect(storage.getItem('push-web-session')).toBe(JSON.stringify(sample))
    expect(store.load()).toEqual(sample)
  })

  it('clears the stored session', () => {
    const storage = memory()
    const store = createSessionStore(storage)
    store.save(sample)
    store.clear()
    expect(storage.getItem('push-web-session')).toBeNull()
    expect(store.load()).toBeNull()
    expect(store.token()).toBeNull()
  })

  it('returns the access token after save', () => {
    const store = createSessionStore(memory())
    store.save(sample)
    expect(store.token()).toBe('mock-access')
  })

  it('returns a null token when nothing is stored', () => {
    const store = createSessionStore(memory())
    expect(store.token()).toBeNull()
    expect(store.load()).toBeNull()
  })

  it('notifies subscribers on save and clear, and stops after unsubscribe', () => {
    const store = createSessionStore(memory())
    let calls = 0
    const stop = store.subscribe(() => {
      calls += 1
    })
    store.save(sample)
    store.clear()
    stop()
    store.save(sample)
    expect(calls).toBe(2)
  })
})
