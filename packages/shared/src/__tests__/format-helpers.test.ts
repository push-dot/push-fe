import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { brandColor, brandOf, fileSize, monthDay, registerBrandColors } from '../index'

describe('brandOf', () => {
  it('picks a stable colour from the name', () => {
    expect(brandOf('모아페이')).toBe('#0E7A5F')
    expect(brandOf('Push')).toBe('#B4501E')
    expect(brandOf('김서준')).toBe('#5B4CF0')
    expect(brandOf('하루랩스')).toBe('#1B6E8F')
  })
})

describe('brandColor', () => {
  it('picks the same board palette colour for the same key', () => {
    expect(brandColor('핀다')).toBe('#0C8599')
    expect(brandColor('u-42')).toBe(brandColor('u-42'))
    expect(brandColor('Push')).toBe('#D9480F')
  })

  it('lets a registered colour win over the pick for that exact key only', () => {
    registerBrandColors({ 'test-co': '#123456' })
    expect(brandColor('test-co')).toBe('#123456')
    expect(brandColor('test-co 주식회사')).not.toBe('#123456')
  })

  it('names no company or person in the shared code', () => {
    expect(readFileSync(new URL('../brand-of.ts', import.meta.url), 'utf8')).not.toMatch(/[가-힣]/)
  })
})

describe('fileSize', () => {
  it('uses the decimal sizes on the docs screen', () => {
    expect(fileSize(640_000)).toBe('640KB')
    expect(fileSize(1_900_000)).toBe('1.9MB')
    expect(fileSize(2_400_000)).toBe('2.4MB')
    expect(fileSize(8_100_000)).toBe('8.1MB')
  })
})

describe('monthDay', () => {
  it('reads the calendar date written in the string', () => {
    expect(monthDay('2026-11-03')).toBe('11월 3일')
    expect(monthDay('2026-10-20')).toBe('10월 20일')
    expect(monthDay('2026-10-12T09:00:00+09:00')).toBe('10월 12일')
    expect(monthDay('2026-09-28T09:00:00+09:00')).toBe('9월 28일')
    expect(monthDay('2026-10-20T15:00:00Z')).toBe('10월 20일')
    expect(monthDay(null)).toBeNull()
    expect(monthDay('nope')).toBeNull()
  })
})
