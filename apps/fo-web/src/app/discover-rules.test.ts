import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

const rule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...css.matchAll(new RegExp(`(?:^|\\n|\\})${escaped}\\{([^}]*)\\}`, 'g'))]
  return matches.at(-1)?.[1] ?? ''
}

describe('discover styles', () => {
  it('keeps the shared field and sheet control rule at class weight, so local paddings win', () => {
    expect(css).toContain('.browser .field :where(input:not([type=file]):not([type=checkbox]):not([type=radio]),select,textarea)')
    expect(css).toContain('.browser .sheet :where(input:not([type=checkbox]):not([type=radio]),textarea)')
    expect(css).not.toMatch(/\.browser \.(field|sheet) :is\(input/)
  })

  it('draws the narrow social category chips in t1, the selected one in acText', () => {
    expect(rule('.browser .social-cats .side-link')).toContain('color:var(--t1)')
    expect(rule('.browser .social-cats .side-link.on')).toContain('color:var(--acText)')
  })

  it('sets the offer send button at 16px like the board', () => {
    expect(rule('.browser .sheet .btn.offer-send')).toBe('font-size:16px')
  })

  it('keeps a count and its unit on one line in the apply rows', () => {
    expect(rule('.browser .apply-copy .c1')).toBe('word-break:keep-all')
  })
})
