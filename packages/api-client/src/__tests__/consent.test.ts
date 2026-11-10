import { LEGAL_VERSION } from '@push/shared'
import { describe, expect, it } from 'vitest'
import { needsTerms } from '../consent'
import type { ConsentTerms } from '../types'

const terms = (overrides: Partial<ConsentTerms> = {}): ConsentTerms => ({
  version: LEGAL_VERSION,
  age14At: '2026-10-21T00:00:00.000Z',
  serviceTermsAt: '2026-10-21T00:00:00.000Z',
  privacyAt: '2026-10-21T00:00:00.000Z',
  marketing: false,
  marketingAt: null,
  ...overrides,
})

describe('needsTerms', () => {
  it('asks again until all three required terms are stored', () => {
    expect(needsTerms({})).toBe(true)
    expect(needsTerms({ terms: terms({ privacyAt: null }) })).toBe(true)
    expect(needsTerms({ terms: terms({ age14At: null }) })).toBe(true)
  })

  it('lets an account with the required terms through, marketing or not', () => {
    expect(needsTerms({ terms: terms() })).toBe(false)
  })

  it('asks again when the stored terms version is not the current one', () => {
    expect(needsTerms({ terms: terms({ version: '2026-10-29' }) })).toBe(true)
    expect(needsTerms({ terms: terms({ version: null }) })).toBe(true)
    expect(needsTerms({ terms: terms({ version: '1.0' }) }, '2.0')).toBe(true)
    expect(needsTerms({ terms: terms({ version: '2.0' }) }, '2.0')).toBe(false)
  })
})
