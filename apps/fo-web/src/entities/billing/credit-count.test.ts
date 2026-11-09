import { describe, expect, it } from 'vitest'
import { EMPLOYER_PLAN_CARDS } from '../../shared/model/employer-plans'
import { creditCount, creditText } from './credit-count'

describe('creditCount', () => {
  it('shows push-be micro credits divided by its DISPLAY_MICRO of 6000', () => {
    // push-be core-api billing/credits.ts EMPLOYER grants and routes/billing.ts PACK_MICRO
    const server = { BASIC: 18_000_000, PRO: 90_000_000, ULTRA: 180_000_000 }
    for (const card of EMPLOYER_PLAN_CARDS) expect(creditText(creditCount(server[card.id]))).toBe(card.credits)
    expect(creditCount(9_000_000)).toBe(1500)
    expect(creditCount(11_280_000)).toBe(1880)
    expect(creditText(9840)).toBe('9,840')
  })
})
