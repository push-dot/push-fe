import { describe, expect, it } from 'vitest'
import { themeOf } from './bridge'

describe('themeOf', () => {
  it('applies the theme from __PUSH__', () => {
    expect(themeOf('dark')).toBe('dark')
  })

  it('updates on push:theme', () => {
    expect(themeOf('light')).toBe('light')
  })

  it('ignores unknown values', () => {
    expect(themeOf('system')).toBeUndefined()
    expect(themeOf(1)).toBeUndefined()
  })
})
