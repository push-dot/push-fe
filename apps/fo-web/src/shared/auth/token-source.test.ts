import { describe, expect, it } from 'vitest'
import { accessToken } from './token-source'

describe('accessToken', () => {
  it('uses the injected token inside a webview and ignores the session', () => {
    expect(accessToken({ webView: true, injected: 'native-token', session: 'web-token' })).toBe('native-token')
    expect(accessToken({ webView: true, injected: null, session: 'web-token' })).toBeNull()
    expect(accessToken({ webView: true, injected: undefined, session: 'web-token' })).toBeUndefined()
  })

  it('uses the session token in the browser and ignores the injected token', () => {
    expect(accessToken({ webView: false, injected: 'native-token', session: 'web-token' })).toBe('web-token')
    expect(accessToken({ webView: false, injected: 'native-token', session: null })).toBeNull()
    expect(accessToken({ webView: false, injected: 'native-token', session: undefined })).toBeUndefined()
  })
})
