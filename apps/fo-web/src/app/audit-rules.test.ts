import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

const rule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...css.matchAll(new RegExp(`${escaped}\\{([^}]*)\\}`, 'g'))]
  return matches.at(-1)?.[1] ?? ''
}

describe('v2 selected styles', () => {
  it('top nav: t2 idle, acText 700 with a 2px underline when selected', () => {
    expect(rule('.browser .nav a')).toContain('color:var(--t2)')
    expect(rule('.browser .nav a.on')).toBe('color:var(--acText);font-weight:700')
    expect(rule('.browser .nav a.on::after')).toContain('height:2px')
  })

  it('side menu and chips: lavender ring', () => {
    for (const selector of ['.browser .side-link.on', '.browser .seg button[aria-selected="true"],.browser .seg button[aria-pressed="true"]']) {
      expect(rule(selector)).toContain('box-shadow:inset 0 0 0 1.5px var(--ac)')
    }
  })
})
