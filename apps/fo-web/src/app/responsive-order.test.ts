import { describe, expect, it } from 'vitest'
import styles from '../styles.css?raw'

type Rule = { at: number; selector: string; props: string[] }

const rulesIn = (css: string, offset: number): Rule[] =>
  [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].flatMap((m) => {
    const props = m[2]!.split(';').map((d) => d.split(':')[0]!.trim()).filter(Boolean)
    return m[1]!.split(',').map((selector) => ({ at: offset + m.index!, selector: selector.trim(), props }))
  })

const blocks = [...styles.matchAll(/@media \(max-width:(?:1024|600)px\)\{([^@]*?)\n\}/g)]
const responsive = blocks.flatMap((m) => rulesIn(m[1]!, m.index!))
const base = rulesIn(blocks.reduce((css, m) => css.replace(m[0], ' '.repeat(m[0].length)), styles), 0)

describe('responsive rules', () => {
  it('are not overridden by a base rule later in the file', () => {
    expect(responsive.length).toBeGreaterThan(20)
    const overridden = responsive.flatMap((rule) =>
      base
        .filter((later) => later.at > rule.at && later.selector === rule.selector)
        .flatMap((later) => later.props.filter((prop) => rule.props.includes(prop)).map((prop) => `${rule.selector} ${prop}`)),
    )
    expect(overridden).toEqual([])
  })
})
