import { describe, expect, it } from 'vitest'
import { dDay, initials, periodLabel, roleLabel } from './format'

describe('format', () => {
  const today = new Date(2026, 9, 20, 23, 30)
  it('dDay', () => {
    expect(dDay('2026-11-02', today)).toBe('D-13')
    expect(dDay('2026-10-20', today)).toBe('D-day')
    expect(dDay('2026-10-19', today)).toBe('마감')
    expect(dDay(null, today)).toBeNull()
  })
  it('periodLabel / roleLabel / initials', () => {
    expect(periodLabel({ startedOn: '2023-03-01', endedOn: null })).toBe('2023년 3월 – 현재')
    expect(periodLabel({ startedOn: '2021-07-01', endedOn: '2023-02-28' })).toBe('2021년 7월 – 2023년 2월')
    expect(roleLabel('dev', 4)).toBe('개발 · 4년차')
    expect(roleLabel(null, 4)).toBe('4년차')
    expect(roleLabel('ops', null)).toBe('경영지원')
    expect(initials('이하은')).toBe('하은')
    expect(initials('민지')).toBe('민지')
  })
})
