import { describe, expect, it } from 'vitest'
import { postAge } from './post-age'

const now = new Date('2026-10-21T01:00:00.000Z').getTime()

describe('postAge', () => {
  it('reads weeks between one and four weeks, as the WebMyPosts board does', () => {
    expect(postAge('2026-10-18T01:00:00.000Z', now)).toBe('3일 전')
    expect(postAge('2026-10-14T01:00:00.000Z', now)).toBe('1주 전')
    expect(postAge('2026-10-07T01:00:00.000Z', now)).toBe('2주 전')
    expect(postAge('2026-09-01T01:00:00.000Z', now)).toBe('9월 1일')
  })
})
