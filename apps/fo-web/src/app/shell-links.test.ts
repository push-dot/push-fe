import { describe, expect, it } from 'vitest'
import { NAV } from './constants'
import { topEndLinks } from './shell-links'

describe('topEndLinks', () => {
  it('gives a guest the same search entry a signed-in header has', () => {
    const guest = topEndLinks(false)
    const signedIn = topEndLinks(true)
    expect(guest).toEqual([{ to: '/search', label: NAV.search }])
    expect(signedIn).toEqual([
      { to: '/search', label: NAV.search },
      { to: '/notifications', label: NAV.notifications },
    ])
  })
})
