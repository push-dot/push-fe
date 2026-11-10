import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

const rule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (
    [...css.matchAll(new RegExp(`(?:^|\\n|\\})${escaped}\\{([^}]*)\\}`, 'g'))].at(-1)?.[1] ?? ''
  )
}

describe('open sheet scroll lock', () => {
  it('keeps the page still while a sheet or menu sheet is open', () => {
    expect(css).toContain('html:has(.sheet-scrim),html:has(.msheet-scrim){overflow:hidden}')
    expect(rule('.sheet')).toContain('overscroll-behavior:contain')
    expect(css).toContain(
      '.browser .sheet-scrim{align-items:flex-start;padding:160px 16px 24px;background:rgba(10,12,16,.42);overflow:auto;overscroll-behavior:contain}',
    )
    expect(rule('.browser .msheet')).toContain('overscroll-behavior:contain')
  })
})
