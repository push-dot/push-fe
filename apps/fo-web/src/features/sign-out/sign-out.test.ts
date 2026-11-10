import { beforeEach, describe, expect, it, vi } from 'vitest'

const authLogout = vi.hoisted(() => vi.fn(async () => undefined))
const store = vi.hoisted(() => ({ session: null as { refreshToken: string } | null }))
vi.mock('../../shared/api/operations', () => ({ authLogout }))
vi.mock('../../shared/auth/session', () => ({
  sessionStore: {
    load: () => store.session,
    clear: vi.fn(() => {
      store.session = null
    }),
  },
}))

const { signOut } = await import('./sign-out')

beforeEach(() => {
  vi.clearAllMocks()
  store.session = { refreshToken: 'rt-1' }
})

describe('signOut', () => {
  it('revokes the refresh token, then drops the session and the cached reads', async () => {
    const queryClient = { clear: vi.fn() }
    await signOut(queryClient)
    expect(authLogout).toHaveBeenCalledWith('rt-1')
    expect(store.session).toBeNull()
    expect(queryClient.clear).toHaveBeenCalled()
  })

  it('still signs out when the revoke fails', async () => {
    authLogout.mockRejectedValueOnce(new Error('offline'))
    const queryClient = { clear: vi.fn() }
    await signOut(queryClient)
    expect(store.session).toBeNull()
    expect(queryClient.clear).toHaveBeenCalled()
  })

  it('skips the revoke for a deleted account', async () => {
    const queryClient = { clear: vi.fn() }
    await signOut(queryClient, { revoke: false })
    expect(authLogout).not.toHaveBeenCalled()
    expect(queryClient.clear).toHaveBeenCalled()
  })
})
