import { describe, expect, it } from 'vitest'
import { mockPersona, mockSession, setMockPersona } from '../mock'
import { createSessionStore, type StorageLike } from '../shared/auth/session'
import { gateAccount } from '../shared/auth/return-path'
import { employerGate, needsLogin } from '../shared/model/access'
import { postingActionMode } from '../pages/posting/posting-mode'
import { applyMockSearch } from './mock-bootstrap'

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

const storeWith = (kind: Parameters<typeof mockSession>[0] | null) => {
  const store = createSessionStore(memory())
  if (kind) store.save(mockSession(kind))
  return store
}

describe('applyMockSearch', () => {
  it('clears a stored employer session when the url is mock without as', () => {
    setMockPersona('employer')
    const store = storeWith('employer')
    applyMockSearch('?mock=1', store)
    expect(store.load()).toBeNull()
    expect(mockPersona()).toBeNull()
    const mode = postingActionMode({ webView: false, accountType: null })
    expect(mode).toBe('guest')
    expect(needsLogin('/hub', false)).toBe(true)
    expect(needsLogin('/social', false)).toBe(true)
  })

  it('replaces a stored employer session with the personal persona', () => {
    const store = storeWith('employer')
    applyMockSearch('?mock=1&as=personal', store)
    const session = store.load()
    expect(session?.user).toMatchObject({ displayName: '김서준', accountType: 'PERSONAL', companyId: null })
    expect(mockPersona()).toBe('personal')
    expect(postingActionMode({ webView: false, accountType: session?.user.accountType ?? null })).toBe('personal')
  })

  it('replaces a stored personal session with the employer persona', () => {
    const store = storeWith('personal')
    applyMockSearch('?mock=1&as=employer', store)
    const session = store.load()
    expect(session?.user).toMatchObject({ displayName: '모아페이', accountType: 'EMPLOYER', companyId: 'co-1' })
    expect(session?.user.displayName).not.toBe('김서준')
    expect(mockPersona()).toBe('employer')
  })

  it('replaces the session for employer-pro and employer-ultra', () => {
    const pro = storeWith('personal')
    applyMockSearch('?mock=1&as=employer-pro', pro)
    expect(pro.load()?.user.companyId).toBe('co-1')
    expect(mockPersona()).toBe('employer-pro')
    const ultra = storeWith('employer')
    applyMockSearch('mock=1&as=employer-ultra', ultra)
    expect(ultra.load()?.user.accountType).toBe('EMPLOYER')
    expect(mockPersona()).toBe('employer-ultra')
  })

  it('treats an unknown as as a guest and clears the session', () => {
    const store = storeWith('employer')
    applyMockSearch('?mock=1&as=nope', store)
    expect(store.load()).toBeNull()
    expect(mockPersona()).toBeNull()
  })

  it('leaves a real session alone when the url has no mock param', () => {
    setMockPersona('personal')
    const store = storeWith('employer')
    applyMockSearch('?as=personal', store)
    expect(store.load()?.user.accountType).toBe('EMPLOYER')
    expect(mockPersona()).toBe('personal')
  })

  it('sends an unverified employer to verify and keeps the verify form off login', () => {
    const store = storeWith('personal')
    applyMockSearch('?mock=1&as=employer-new', store)
    const account = gateAccount(store.load())
    expect(account).toEqual({ accountType: 'EMPLOYER', verified: false })
    expect(employerGate('/employer/postings', account)).toBe('verify')
    expect(employerGate('/employer/chat', account)).toBe('verify')
    expect(employerGate('/employer/verify', account)).toBe('ok')
    expect(needsLogin('/employer/verify', store.load() !== null)).toBe(false)
  })
})
