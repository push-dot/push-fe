import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import styles from '../../styles.css?raw'

const shell = readFileSync(new URL('../../app/shell.tsx', import.meta.url), 'utf8')
const rule = (selector: string) =>
  styles.match(
    new RegExp(`(^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`),
  )?.[2] ?? ''

describe('auth colours come from tokens', () => {
  it('fills the orange alert mark like the board in both themes (audit layer --orangeFill)', () => {
    expect(rule('.browser .auth-alert.orange .auth-alert-mark')).toContain(
      'background:var(--orangeFill)',
    )
  })

  it('draws the header 기업 badge with the shared .badge.biz colours', () => {
    expect(shell).toMatch(/className="badge biz auth-biz"/)
    expect(rule('.browser .auth-biz')).not.toMatch(/background|color/)
  })

  it('writes white on fills as a token, not #fff', () => {
    for (const selector of [
      '.browser .auth-alert-mark',
      '.browser .auth-invite-mark .av',
      '.browser .auth-invite-done',
    ]) {
      expect(rule(selector)).toContain('color:var(--onFill)')
    }
  })
})
