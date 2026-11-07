import type { BlockedUser } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { blockedCount, blockedLine } from './blocked'

const row = (createdAt: string, companyName?: string | null): BlockedUser => ({ user: { id: 'u1', displayName: '오지현', companyName }, createdAt })
const NOW = new Date(2026, 10, 8)

describe('blockedLine', () => {
  it('shows the company, then the blocked date', () => {
    expect(blockedLine(row(new Date(2026, 10, 7, 12).toISOString(), '모아페이'), NOW)).toBe('모아페이 · 11월 7일 차단')
  })

  it('drops the company when the server sends none', () => {
    expect(blockedLine(row(new Date(2026, 9, 3, 12).toISOString()), NOW)).toBe('10월 3일 차단')
    expect(blockedLine(row(new Date(2026, 9, 3, 12).toISOString(), null), NOW)).toBe('10월 3일 차단')
  })

  it('adds the year for an earlier year', () => {
    expect(blockedLine(row(new Date(2025, 9, 3, 12).toISOString()), NOW)).toBe('2025. 10. 3. 차단')
  })
})

describe('blockedCount', () => {
  it('reads N명, 0명 included, and nothing until the total is known', () => {
    expect(blockedCount(2)).toBe('2명')
    expect(blockedCount(0)).toBe('0명')
    expect(blockedCount(undefined)).toBeUndefined()
  })
})
