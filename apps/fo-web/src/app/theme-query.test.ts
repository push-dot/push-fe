import { describe, expect, it } from 'vitest'
import { themeFromQuery } from './theme-query'

describe('theme query', () => {
  it('accepts light', () => {
    expect(themeFromQuery('light', false)).toBe('light')
  })

  it('accepts dark', () => {
    expect(themeFromQuery('dark', false)).toBe('dark')
  })

  it('ignores other values', () => {
    expect(themeFromQuery('system', false)).toBeNull()
    expect(themeFromQuery(null, false)).toBeNull()
    expect(themeFromQuery('dark', true)).toBeNull()
  })
})
