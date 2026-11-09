import { describe, expect, it } from 'vitest'
import { applyThemeChoice, readTheme } from './theme'

describe('theme choice', () => {
  it('sets or clears data-theme', () => {
    const root = { dataset: {} as DOMStringMap }
    applyThemeChoice('dark', root)
    expect(root.dataset.theme).toBe('dark')
    applyThemeChoice('system', root)
    expect(root.dataset.theme).toBeUndefined()
  })

  it('reads system without storage', () => {
    expect(readTheme()).toBe('system')
  })
})
