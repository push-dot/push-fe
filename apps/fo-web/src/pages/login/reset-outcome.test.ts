import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { linkOutcome, requestOutcome } from './reset-outcome'

describe('reset mail request', () => {
  it('shows the sent screen only when push-be took the request', () => {
    expect(requestOutcome(null)).toBe('sent')
  })

  it('says to wait when the shared mail bucket is full instead of claiming a mail went out', () => {
    expect(
      requestOutcome(new ApiError('slow down', 'RATE_LIMITED', 429, { retryAfterSec: 60 })),
    ).toBe('limit')
  })

  it('reports a failed send (mail provider, offline) instead of the sent screen', () => {
    expect(requestOutcome(new ApiError('mail failed', 'INTERNAL', 500))).toBe('failed')
    expect(requestOutcome(new TypeError('Failed to fetch'))).toBe('failed')
  })
})

describe('reset link lookup', () => {
  it('keeps the form for a live link', () => {
    expect(linkOutcome(null)).toEqual({ view: 'form' })
  })

  it('shows the expired screen with the address for 410', () => {
    expect(linkOutcome(new ApiError('expired', 'TOKEN_EXPIRED', 410, { email: 'a@b.kr' }))).toEqual(
      { view: 'expired', email: 'a@b.kr' },
    )
  })

  it('shows the dead-link screen instead of the form for an unknown or used link (401)', () => {
    expect(linkOutcome(new ApiError('nope', 'UNAUTHENTICATED', 401))).toEqual({ view: 'invalid' })
  })
})
