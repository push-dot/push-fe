import { readFileSync } from 'node:fs'
import type { Consent, Session } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'

import { termsOutcome, termsPending } from './terms-gate'

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

  it('asks a new employer Google account until the consent step saves the terms', async () => {
    // push-be records terms only on the email sign-up; a Google employer starts with none.
    let stored: Consent = { referenceData: false, updatedAt: null }
    const read = vi.fn(async () => stored)
    await expect(termsPending(session('EMPLOYER'), read)).resolves.toBe(true)
    stored = { ...stored, terms: agreed }
    await expect(termsPending(session('EMPLOYER'), read)).resolves.toBe(false)
    expect(read).toHaveBeenCalledWith('at')
  })

  it('lets an employer that agreed on the email sign-up form through', async () => {
    const read = async () => ({ referenceData: true, updatedAt: null, terms: agreed }) as Consent
    await expect(termsPending(session('EMPLOYER'), read)).resolves.toBe(false)
  })
})

describe('termsOutcome', () => {
  it('sends a password login with no recorded consent through the terms step', async () => {
    const read = vi.fn(async () => ({ referenceData: false, updatedAt: null }) as Consent)
    await expect(termsOutcome(session('EMPLOYER'), read)).resolves.toBe('pending')
    expect(read).toHaveBeenCalledWith('at')
  })

  it('lets a password login through once the terms are on record', async () => {
    const read = async () => ({ referenceData: true, updatedAt: null, terms: agreed }) as Consent
    await expect(termsOutcome(session('EMPLOYER'), read)).resolves.toBe('ready')
  })

  it('fails closed when the terms read throws, so the session is not used', async () => {
    const read = async () => {
      throw new Error('offline')
    }
    await expect(termsOutcome(session('EMPLOYER'), read)).resolves.toBe('blocked')
    const page = readFileSync(new URL('./login-page.tsx', import.meta.url), 'utf8')
    const submit = page.slice(page.indexOf('const submitLogin'), page.indexOf('if (phone)'))
    expect(submit.indexOf('termsOutcome')).toBeGreaterThan(-1)
    expect(submit.indexOf('termsOutcome')).toBeLessThan(submit.indexOf('leave(session)'))
    expect(submit).toContain("gate === 'blocked'")
    expect(submit).not.toContain('leave(await authEmailLogin')
  })
})
