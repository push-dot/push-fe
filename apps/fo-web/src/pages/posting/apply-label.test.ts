import { describe, expect, it } from 'vitest'
import { guestApplyAction } from './constants'
import { postingActionMode } from '../../entities/posting'

describe('guest apply', () => {
  it('opens the login dialog for a guest and the sheet for a person', () => {
    expect(postingActionMode({ webView: false, accountType: null })).toBe('guest')
    expect(guestApplyAction('guest', false)).toBe('dialog')
    expect(guestApplyAction('personal', false)).toBe('sheet')
    expect(guestApplyAction('personal', true)).toBe('done')
    expect(guestApplyAction('employer', false)).toBe('ignore')
  })
})
