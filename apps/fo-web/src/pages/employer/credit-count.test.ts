import { describe, expect, it } from 'vitest'
import { creditCount, creditText } from './credit-count'

describe('creditCount', () => {
  it('turns micro credits into the credit count the plans screen shows', () => {
    expect(creditCount(15000000)).toBe(15000)
    expect(creditCount(3000000)).toBe(3000)
    expect(creditText(9840)).toBe('9,840')
  })
})
