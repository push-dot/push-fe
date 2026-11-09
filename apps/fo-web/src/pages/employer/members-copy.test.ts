import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { INVITE_GONE, MEMBERS_ACTION_FAILED, MEMBERS_ADMIN_ONLY, SEAT_FULL_TITLE, inviteExpiry, memberActionError, memberInitials } from './constants'

describe('member action errors', () => {
  it('reads the resend cooldown from push-be 429 details', () => {
    expect(memberActionError(new ApiError('wait', 'RATE_LIMITED', 429, { retryAfterSec: 42 }))).toBe('42초 뒤에 다시 보낼 수 있어요')
    expect(memberActionError(new ApiError('wait', 'RATE_LIMITED', 429))).toBe(MEMBERS_ACTION_FAILED)
  })

  it('tells a member that writes are for the admin, and names a full seat count apart', () => {
    expect(memberActionError(new ApiError('no', 'FORBIDDEN', 403))).toBe(MEMBERS_ADMIN_ONLY)
    expect(memberActionError(new ApiError('full', 'SEAT_LIMIT', 403))).toBe(SEAT_FULL_TITLE)
  })

  it('says an invite is gone when it was accepted or cancelled meanwhile', () => {
    expect(memberActionError(new ApiError('gone', 'NOT_FOUND', 404))).toBe(INVITE_GONE)
    expect(memberActionError(new Error('offline'))).toBe(MEMBERS_ACTION_FAILED)
  })
})

describe('member rows', () => {
  it('counts the days an invite has left', () => {
    const now = Date.parse('2026-10-21T01:00:00.000Z')
    expect(inviteExpiry('sora.park@moapay.kr', '2026-10-28T01:00:00.000Z', now)).toBe('sora.park@moapay.kr · 7일 뒤 만료')
    expect(inviteExpiry('a@b.kr', '2026-10-20T01:00:00.000Z', now)).toBe('a@b.kr · 만료됨')
  })

  it('draws a Korean name by its given name like the boards', () => {
    expect(memberInitials('이민아')).toBe('민아')
    expect(memberInitials('sora')).toBe('S')
  })
})
