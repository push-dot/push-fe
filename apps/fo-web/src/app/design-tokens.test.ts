import tokens from '@push/design-system/tokens.css?raw'
import { describe, expect, it } from 'vitest'
import styles from '../styles.css?raw'

const declared = (css: string) => new Set([...css.matchAll(/(--[\w-]+):/g)].map((m) => m[1]))
const used = (css: string) => new Set([...css.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]))

describe('design tokens', () => {
  it('come only from the design system', () => {
    expect([...declared(styles)]).toEqual([])
  })

  it('cover every variable the styles use', () => {
    const missing = [...used(styles)].filter((name) => !declared(tokens).has(name))
    expect(missing).toEqual([])
  })

  it('leave type classes to the design system', () => {
    expect(styles).not.toMatch(/(^|\n)\.(h1|h2|h3|b1|b2|c1|c2)\{/)
  })
})
