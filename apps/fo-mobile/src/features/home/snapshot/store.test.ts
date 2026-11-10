import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HOME_SNAPSHOT_VERSION } from './constants'
import { clearHomeSnapshot, parseHomeSnapshot, readHomeSnapshot, writeHomeSnapshot } from './store'
import type { HomeSnapshot } from './types'

const storage = vi.hoisted(() => new Map<string, string>())

vi.mock('expo-secure-store', () => ({
  getItemAsync: (key: string) => Promise.resolve(storage.get(key) ?? null),
  setItemAsync: (key: string, value: string) => {
    storage.set(key, value)
    return Promise.resolve()
  },
  deleteItemAsync: (key: string) => {
    storage.delete(key)
    return Promise.resolve()
  },
}))

const snapshot = (savedAt: number): HomeSnapshot => ({
  version: HOME_SNAPSHOT_VERSION,
  savedAt,
  sections: {
    latest: { data: [], page: { nextCursor: null, hasMore: false } },
    deadline: { data: [], page: { nextCursor: null, hasMore: false } },
    popular: { data: [], page: { nextCursor: null, hasMore: false } },
  },
  notifications: { data: [], page: { nextCursor: null, hasMore: false } },
})

beforeEach(() => storage.clear())

describe('home snapshot store', () => {
  it('rejects expired, wrong-version, and malformed payloads', () => {
    const now = 1_000_000
    expect(parseHomeSnapshot(null, now)).toBeNull()
    expect(parseHomeSnapshot('{', now)).toBeNull()
    expect(parseHomeSnapshot(JSON.stringify({ ...snapshot(now - 8 * 864e5), savedAt: now - 8 * 864e5 }), now)).toBeNull()
    expect(parseHomeSnapshot(JSON.stringify({ ...snapshot(now), version: 0 }), now)).toBeNull()
  })

  it('round-trips a fresh snapshot per user', async () => {
    const now = 2_000_000
    const body = snapshot(now)
    await writeHomeSnapshot('u1', body)
    await expect(readHomeSnapshot('u1', now)).resolves.toEqual(body)
    await clearHomeSnapshot('u1')
    await expect(readHomeSnapshot('u1', now)).resolves.toBeNull()
  })
})
