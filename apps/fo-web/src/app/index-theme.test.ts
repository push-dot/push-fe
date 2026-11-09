import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
const script = html.match(/<script>([\s\S]*?)<\/script>/)![1]!

const boot = (search: string, webView = false) => {
  const dataset: Record<string, string> = {}
  const stored: string[] = []
  const localStorage = { getItem: () => 'dark', setItem: (key: string) => stored.push(key) }
  const window = webView ? { ReactNativeWebView: {} } : {}
  const document = { documentElement: { dataset, hasAttribute: (name: string) => name === 'data-theme' && 'theme' in dataset } }
  runInNewContext(script, { location: { search }, URLSearchParams, localStorage, window, document })
  return { theme: dataset.theme, stored }
}

describe('index.html theme boot', () => {
  it('applies ?theme= for this load only, in the browser and in the WebView', () => {
    expect(boot('?theme=dark')).toEqual({ theme: 'dark', stored: [] })
    expect(boot('?theme=light&mock=1', true)).toEqual({ theme: 'light', stored: [] })
  })

  it('falls back to the settings choice in the browser, never in the WebView', () => {
    expect(boot('')).toEqual({ theme: 'dark', stored: [] })
    expect(boot('?theme=system')).toEqual({ theme: 'dark', stored: [] })
    expect(boot('', true)).toEqual({ theme: undefined, stored: [] })
  })
})
