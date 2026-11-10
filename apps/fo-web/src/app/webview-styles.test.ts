import { describe, expect, it } from 'vitest'

import styles from '../styles.css?raw'

const rule = (selector: string) =>
  styles.match(
    new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`),
  )?.[2] ?? ''

describe('webview posting styles', () => {
  it('drops the unused unscoped .fit-score rule', () => {
    expect(styles).not.toMatch(/\.fit-score/)
  })

  it('keeps a single browser weight-800 rule', () => {
    expect(styles.match(/\.browser \.w8\{font-weight:800\}/g)).toEqual([
      '.browser .w8{font-weight:800}',
    ])
  })

  it('gives the posting company row 12px, the gap the WebView detail uses', () => {
    expect(rule('.company')).toContain('gap:12px')
  })
})
