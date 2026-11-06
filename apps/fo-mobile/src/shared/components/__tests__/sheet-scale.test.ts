import { describe, expect, it } from 'vitest'
import { floatingSheet } from '../sheet-scale'

describe('floating sheet', () => {
  it('lays out at the floating width and scales back up on iOS 26 phones with a home indicator', () => {
    expect(floatingSheet(402, '26.3', 34)).toEqual({ width: 386, scale: 402 / 386 })
    expect(floatingSheet(440, 26, 34)?.width).toBe(424)
  })

  it('draws 1:1 below iOS 26 and on home-button phones', () => {
    expect(floatingSheet(402, '18.6', 34)).toBeNull()
    expect(floatingSheet(375, '26.0', 0)).toBeNull()
  })
})
