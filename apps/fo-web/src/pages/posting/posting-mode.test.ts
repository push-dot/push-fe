import { describe, expect, it } from 'vitest'
import { postingActionMode } from './posting-mode'

describe('postingActionMode', () => {
  it('uses the webview chrome even for an employer', () => {
    expect(postingActionMode({ webView: true, accountType: 'EMPLOYER' })).toBe('webview')
    expect(postingActionMode({ webView: true, accountType: 'PERSONAL' })).toBe('webview')
    expect(postingActionMode({ webView: true, accountType: null })).toBe('webview')
  })
  it('uses the employer actions for an employer account', () => {
    expect(postingActionMode({ webView: false, accountType: 'EMPLOYER' })).toBe('employer')
  })
  it('uses the personal actions for a personal account', () => {
    expect(postingActionMode({ webView: false, accountType: 'PERSONAL' })).toBe('personal')
  })
  it('uses guest actions when nobody is logged in', () => {
    expect(postingActionMode({ webView: false, accountType: null })).toBe('guest')
  })
})
