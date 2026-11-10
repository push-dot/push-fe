import { describe, expect, it } from 'vitest'

import { dividerLabel, isNewDay, listTime } from './offer-time'

const at = (month: number, day: number, hour: number, minute = 0) => new Date(2026, month - 1, day, hour, minute).toISOString()
const now = new Date(2026, 9, 21, 16, 0).getTime()

describe('listTime', () => {
  it('uses hours within the same calendar day', () => {
    expect(listTime(at(10, 21, 13, 12), now)).toBe('2시간 전')
  })
  it('says 어제 for the previous calendar day, inside 24 hours or beyond', () => {
    expect(listTime(at(10, 20, 20, 14), now)).toBe('어제')
    expect(listTime(at(10, 20, 9, 0), now)).toBe('어제')
  })
  it('counts days up to a week and then shows the date', () => {
    expect(listTime(at(10, 19, 9, 0), now)).toBe('2일 전')
    expect(listTime(at(10, 14, 11, 3), now)).toBe('10월 14일')
  })
})

describe('dividerLabel / isNewDay', () => {
  it('shows 어제 only for yesterday and the date otherwise', () => {
    expect(dividerLabel(at(10, 20, 20, 14), now)).toBe('어제')
    expect(dividerLabel(at(10, 21, 13, 12), now)).toBe('10월 21일')
  })
  it('starts a new divider on the first message and when the day changes', () => {
    expect(isNewDay(at(10, 21, 13, 12), undefined)).toBe(true)
    expect(isNewDay(at(10, 21, 14, 40), at(10, 21, 13, 12))).toBe(false)
    expect(isNewDay(at(10, 22, 9, 0), at(10, 21, 14, 40))).toBe(true)
  })
})
