import { describe, expect, it } from 'vitest'
import { careerPeriod } from './career-period'

describe('careerPeriod', () => {
  it('counts both end months and says 지금 for a current job', () => {
    expect(careerPeriod({ startedOn: '2022-03-01', endedOn: null }, new Date(2026, 9, 21))).toBe('2022.03 – 지금 · 4년 8개월')
  })

  it('shows years and months for a finished job', () => {
    expect(careerPeriod({ startedOn: '2021-01-01', endedOn: '2022-02-28' })).toBe('2021.01 – 2022.02 · 1년 2개월')
  })

  it('drops the zero part', () => {
    expect(careerPeriod({ startedOn: '2020-01-01', endedOn: '2020-12-31' })).toBe('2020.01 – 2020.12 · 1년')
    expect(careerPeriod({ startedOn: '2020-01-01', endedOn: '2020-03-31' })).toBe('2020.01 – 2020.03 · 3개월')
  })
})
