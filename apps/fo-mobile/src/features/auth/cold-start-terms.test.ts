import type { Consent, Session } from '@push/api-client'
import { LEGAL_VERSION } from '@push/shared'
import { describe, expect, it, vi } from 'vitest'
import { evaluateColdStartTerms, runColdStartTermsCheck } from './cold-start-terms'

const session = {
  accessToken: 'at',
  refreshToken: 'rt',
  expiresIn: 3600,
  user: { id: 'u1', displayName: '테스트', locale: 'ko' },
} satisfies Session

const terms = (version: string | null): Consent => ({
  referenceData: false,
  updatedAt: null,
  terms: {
    version,
    age14At: '2026-10-21T00:00:00.000Z',
    serviceTermsAt: '2026-10-21T00:00:00.000Z',
    privacyAt: '2026-10-21T00:00:00.000Z',
    marketing: false,
    marketingAt: null,
  },
})

describe('cold-start terms check', () => {
  it('routes stale terms into signup-terms without blocking on errors', async () => {
    const hold = vi.fn()
    const route = vi.fn()
    expect(evaluateColdStartTerms(terms('2020-01-01'), session, { hold, route })).toBe('routed')
    expect(hold).toHaveBeenCalledWith(session)
    expect(route).toHaveBeenCalled()

    await expect(
      runColdStartTermsCheck(session, async () => terms(LEGAL_VERSION), { hold, route }),
    ).resolves.toBe('current')
    await expect(runColdStartTermsCheck(session, async () => { throw new Error('offline') }, { hold, route })).resolves.toBe(
      'silent',
    )
  })
})
