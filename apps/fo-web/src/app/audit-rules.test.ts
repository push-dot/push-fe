import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8')

const rule = (selector: string) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...css.matchAll(new RegExp(`${escaped}\\{([^}]*)\\}`, 'g'))]
  return matches.at(-1)?.[1] ?? ''
}

describe('audit rules', () => {
  it('nav idle is t1', () => {
    expect(rule('.browser .nav a')).toContain('color:var(--t1)')
  })

  it('nav selected is acText with inset ring', () => {
    const selected = rule('.browser .nav a.on')
    expect(selected).toContain('color:var(--acText)')
    expect(selected).toContain('background:var(--acSoft)')
    expect(selected).toContain('box-shadow:inset 0 0 0 1.5px var(--ac)')
  })

  it('nav min height 48', () => {
    expect(rule('.browser .nav a')).toContain('min-height:48px')
  })
})
