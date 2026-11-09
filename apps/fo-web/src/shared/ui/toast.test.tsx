import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Toast from './toast'

const markup = () => renderToStaticMarkup(<Toast message="저장했어요" />)

describe('Toast', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('draws the check icon in the browser', () => {
    vi.stubGlobal('window', {})
    expect(markup()).toContain('toast-ic')
  })

  it('leaves the icon out in the app WebView, where the native toast owns it', () => {
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => undefined } })
    const html = markup()
    expect(html).not.toContain('toast-ic')
    expect(html).toContain('저장했어요')
  })
})
