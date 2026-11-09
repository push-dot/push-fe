import { describe, expect, it } from 'vitest'

import { opensUp } from './popover'

describe('opensUp', () => {
  it('opens a menu above its button when it would run past the bottom of the window', () => {
    expect(opensUp({ top: 820, bottom: 960 }, { top: 776 }, 900)).toBe(true)
  })

  it('keeps it below when it fits, or when there is no room above either', () => {
    expect(opensUp({ top: 300, bottom: 440 }, { top: 256 }, 900)).toBe(false)
    expect(opensUp({ top: 100, bottom: 960 }, { top: 56 }, 900)).toBe(false)
  })
})
