import { describe, expect, it } from 'vitest'
import { notificationPath } from './notification-path'

describe('notificationPath', () => {
  it('opens 지원활동 for an application stage or an activity target', () => {
    expect(
      notificationPath({
        type: 'APPLICATION_STAGE',
        target: { kind: 'activity', id: 'applications' },
      }),
    ).toBe('/me?tab=activity&chip=applications')
    expect(
      notificationPath({
        type: 'COMMENT',
        target: { kind: 'activity', id: 'applications' },
      }),
    ).toBe('/me?tab=activity&chip=applications')
  })

  it('opens the posting, offer, or post named by the target', () => {
    expect(notificationPath({ type: 'DEADLINE', target: { kind: 'posting', id: 'p1' } })).toBe('/postings/p1')
    expect(notificationPath({ type: 'OFFER', target: { kind: 'offer', id: 'offer-1' } })).toBe('/offers/offer-1')
    expect(notificationPath({ type: 'COMMENT', target: { kind: 'post', id: 'post-1' } })).toBe('/posts/post-1')
  })

  it('does not open an AI conversation', () => {
    expect(notificationPath({ type: 'AI_DONE', target: { kind: 'conversation', id: 'c1' } })).toBeNull()
  })
})
