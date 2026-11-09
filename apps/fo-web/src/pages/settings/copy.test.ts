import { describe, expect, it } from 'vitest'
import type { BlockedUser, ListEnvelope } from '@push/api-client'

import { LOCALE_NOTE, NOTIFY_ROWS } from './constants'
import { blockedCount, blockedLine, settingsSections, withoutBlocked } from './lib'

describe('settings copy', () => {
  it('reads the board language hint', () => {
    expect(LOCALE_NOTE).toBe('화면과 에이전트 답변 언어가 함께 바뀌어요')
  })

  it('has no app-only agent row on the web', () => {
    expect(NOTIFY_ROWS.map((row) => row.label)).toEqual(['마감 임박 공고', '제안 받음', '댓글과 답글', '지원 상태 변경'])
  })
})

describe('settingsSections', () => {
  it('keeps every row for a personal account', () => {
    const personal = settingsSections('PERSONAL')
    expect(personal.notify).toHaveLength(4)
    expect(personal.hub).toBe(true)
    expect(personal.subscriptionNote).toBe(true)
  })

  it('hides personal-only rows on the employer page', () => {
    const employer = settingsSections('EMPLOYER')
    expect(employer.notify.map((row) => row.label)).toEqual(['마감 임박 공고', '댓글과 답글'])
    expect(employer.hub).toBe(false)
    expect(employer.subscriptionNote).toBe(false)
  })
})

describe('blocked people', () => {
  const now = new Date(2026, 10, 8)

  it('reads the blocked date, with the year only for an earlier year', () => {
    expect(blockedLine(new Date(2026, 10, 7, 12).toISOString(), now)).toBe('11월 7일 차단')
    expect(blockedLine(new Date(2025, 9, 3, 12).toISOString(), now)).toBe('2025년 10월 3일 차단')
  })

  it('reads the count only once the total is known', () => {
    expect(blockedCount(2)).toBe('2명')
    expect(blockedCount(0)).toBe('0명')
    expect(blockedCount(undefined)).toBe('')
  })
})

describe('withoutBlocked', () => {
  const row = (id: string): BlockedUser => ({ user: { id, displayName: id }, createdAt: '2026-11-07T01:00:00.000Z' })
  const list: ListEnvelope<BlockedUser> = { data: [row('u-jihyun'), row('u-minjae-h')], page: { nextCursor: null, hasMore: false, total: 2 } }

  it('drops the unblocked row and the count', () => {
    const next = withoutBlocked(list, 'u-jihyun')
    expect(next?.data.map((item) => item.user.id)).toEqual(['u-minjae-h'])
    expect(next?.page.total).toBe(1)
  })

  it('leaves the list alone for an unknown id or an empty cache', () => {
    expect(withoutBlocked(list, 'nobody')?.page.total).toBe(2)
    expect(withoutBlocked(undefined, 'u-jihyun')).toBeUndefined()
  })
})
