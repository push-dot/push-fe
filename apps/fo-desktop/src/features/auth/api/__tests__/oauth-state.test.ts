import { beforeEach, describe, expect, it } from 'vitest'
import { OAUTH_STATE_STORAGE_KEY } from '../../constants'
import { oauthStateMatches } from '../fetchers'
import { googleStateMatches } from '@/features/calendar/api/fetchers'

describe('oauth state verification', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('accepts a matching auth state and rejects mismatches', () => {
    sessionStorage.setItem(OAUTH_STATE_STORAGE_KEY, 's-1')
    expect(oauthStateMatches('s-1')).toBe(true)
    expect(oauthStateMatches('s-2')).toBe(false)
    expect(oauthStateMatches(null)).toBe(false)
  })

  it('rejects auth state when nothing was stored', () => {
    expect(oauthStateMatches('s-1')).toBe(false)
  })

  it('verifies google callback state when one was stored', () => {
    sessionStorage.setItem('push:google-oauth-state', 'g-1')
    expect(googleStateMatches('g-1')).toBe(true)
    expect(googleStateMatches('g-2')).toBe(false)
  })
})
