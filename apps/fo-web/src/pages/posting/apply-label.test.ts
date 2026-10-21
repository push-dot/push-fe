import { describe, expect, it } from 'vitest'
import { applyConfirmLabel, guestApplyAction } from './constants'
import { postingActionMode } from './posting-mode'

describe('apply label', () => {
  it('names the selected document count', () => {
    expect(applyConfirmLabel(2)).toBe('서류 2개로 지원하기')
  })
})

describe('guest apply', () => {
  it('opens the login dialog for a guest and the sheet for a person', () => {
    expect(postingActionMode({ webView: false, accountType: null })).toBe('guest')
    expect(guestApplyAction('guest', false)).toBe('dialog')
    expect(guestApplyAction('personal', false)).toBe('sheet')
    expect(guestApplyAction('personal', true)).toBe('done')
    expect(guestApplyAction('employer', false)).toBe('ignore')
  })
})
