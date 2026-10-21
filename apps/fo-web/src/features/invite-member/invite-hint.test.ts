import { describe, expect, it } from 'vitest'
import { inviteHint } from './invite-hint'

describe('inviteHint', () => {
  it('tells a non-admin that only an admin can invite', () => {
    expect(inviteHint('PRO', 0, false)).toBe('담당자 초대는 관리자만 할 수 있어요')
    expect(inviteHint('PRO', 2, false)).toBe('담당자 초대는 관리자만 할 수 있어요')
    expect(inviteHint('BASIC', 0, false)).toBe('담당자 초대는 관리자만 할 수 있어요')
    expect(inviteHint(null, 0, false)).toBe('담당자 초대는 관리자만 할 수 있어요')
  })

  it('stays quiet when an admin still has a seat', () => {
    expect(inviteHint('PRO', 0, true)).toBeNull()
    expect(inviteHint('PRO', 1, true)).toBeNull()
    expect(inviteHint('ULTRA', 4, true)).toBeNull()
  })

  it('names Basic when the plan has no seats', () => {
    expect(inviteHint('BASIC', 0, true)).toBe('Basic에서는 담당자를 초대할 수 없어요')
    expect(inviteHint(null, 0, true)).toBe('Basic에서는 담당자를 초대할 수 없어요')
  })

  it('names the filled seat count when a positive limit is reached', () => {
    expect(inviteHint('PRO', 2, true)).toBe('담당자 2/2명까지 초대할 수 있어요')
    expect(inviteHint('ULTRA', 5, true)).toBe('담당자 5/5명까지 초대할 수 있어요')
    expect(inviteHint('PRO', 3, true)).toBe('담당자 3/2명까지 초대할 수 있어요')
  })
})
