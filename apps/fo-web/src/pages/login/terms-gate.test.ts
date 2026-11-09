import type { Consent, Session } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'

import { termsPending } from './terms-gate'

const session = (accountType: 'PERSONAL' | 'EMPLOYER') =>
  ({ accessToken: 'at', refreshToken: 'rt', user: { id: 'u1', accountType } }) as unknown as Session
const agreed = { privacyAt: 'x', serviceTermsAt: 'x', age14At: 'x' } as Consent['terms']

describe('termsPending', () => {
  it('asks a returning personal account that left the consent step before', async () => {
    const read = vi.fn(async () => ({ referenceData: false, updatedAt: null }) as Consent)
    await expect(termsPending(session('PERSONAL'), read)).resolves.toBe(true)
    expect(read).toHaveBeenCalledWith('at')
  })

  it('lets a personal account with the terms on record through', async () => {
    const read = async () => ({ referenceData: false, updatedAt: null, terms: agreed }) as Consent
    await expect(termsPending(session('PERSONAL'), read)).resolves.toBe(false)
  })

  it('never asks an employer account', async () => {
    const read = vi.fn()
    await expect(termsPending(session('EMPLOYER'), read)).resolves.toBe(false)
    expect(read).not.toHaveBeenCalled()
  })
})
