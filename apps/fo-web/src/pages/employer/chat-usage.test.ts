import { describe, expect, it } from 'vitest'
import { usedPercent } from './chat-usage'

describe('usedPercent', () => {
  it('shows what the company used this month, not what is left', () => {
    expect(usedPercent({ monthlyMicroCredits: 15_000_000, spentMicroCredits: 9_840_000, balanceMicroCredits: 5_160_000 })).toBe(66)
    expect(usedPercent({ monthlyMicroCredits: 3_000_000, spentMicroCredits: 1_120_000, balanceMicroCredits: 1_880_000 })).toBe(37)
  })

  it('caps at 100 and reads an empty allowance from the balance', () => {
    expect(usedPercent({ monthlyMicroCredits: 15_000_000, spentMicroCredits: 16_000_000, balanceMicroCredits: 0 })).toBe(100)
    expect(usedPercent({ monthlyMicroCredits: 0, spentMicroCredits: 0, balanceMicroCredits: 0 })).toBe(100)
  })
})
