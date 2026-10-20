import { describe, expect, it } from 'vitest'
import { appliedCount, careerLine, EMPTY_SHEET, filterSummary, givenName, tenureOf } from '../filters'

describe('hub filters', () => {
  it('buckets tenure years', () => {
    expect([0, 2, 3, 5, 6, 9, 10, 15].map(tenureOf)).toEqual(['0-2', '0-2', '3-5', '3-5', '6-9', '6-9', '10+', '10+'])
  })

  it('summarises and counts applied filters', () => {
    const f = { ...EMPTY_SHEET, status: ['seeking' as const], tenure: ['3-5' as const] }
    expect(filterSummary(f)).toBe('3–5년 · 이직/구직중')
    expect(appliedCount(f)).toBe(2)
    expect(appliedCount({ ...f, explore: 'offers' })).toBe(3)
    expect(filterSummary(EMPTY_SHEET)).toBe('')
  })

  it('formats card lines', () => {
    expect(careerLine({ jobCategory: 'dev', tenureYears: 5 })).toBe('개발 · 5년차')
    expect(givenName('김태윤')).toBe('태윤')
  })
})
