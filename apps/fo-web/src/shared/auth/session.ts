import type { Session } from '@push/api-client'
import { browserLocalStorage, browserSessionStorage } from '../lib/storage'
import { SESSION_STORAGE_KEY } from './constants'

export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const memoryStorage = (): StorageLike => {
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

const defaultStorage = (): StorageLike => {
  const local = browserLocalStorage()
  const session = browserSessionStorage()
  if (!local || !session) return memoryStorage()
  return storageForSession(mockDocument(), { local, session })
}

export const storageForSession = (mock: boolean, available: { local: StorageLike; session: StorageLike }) =>
  mock ? available.session : available.local

const mockDocument = () => {
  if (typeof window === 'undefined') return false
  const env = (window as Window & { __PUSH__?: { mock?: boolean } }).__PUSH__
  if (env?.mock) return true
  return new URLSearchParams(window.location.search).has('mock')
}

export const createSessionStore = (storage: StorageLike) => {
  const listeners = new Set<() => void>()
  const emit = () => {
    listeners.forEach((listener) => listener())
  }
  const load = (): Session | null => {
    const raw = storage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    try {
      const parsed = JSON.parse(raw) as Session | null
      if (!parsed || typeof parsed !== 'object' || !parsed.accessToken) return null
      return parsed
    } catch {
      return null
    }
  }
  return {
    load,
    save: (session: Session) => {
      storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
      emit()
    },
    clear: () => {
      storage.removeItem(SESSION_STORAGE_KEY)
      emit()
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    token: () => load()?.accessToken ?? null,
  }
}

export const sessionStore = createSessionStore(defaultStorage())

export const readAccessToken = () => sessionStore.token()
