import { describe, expect, it } from 'vitest'
import { brandGradient } from './brand'

describe('brandGradient', () => {
  it('draws the board gradient recipe', () => {
    expect(brandGradient('#1F3A8A')).toBe('linear-gradient(140deg, #1F3A8A 0%, color-mix(in srgb, #1F3A8A 55%, #000) 100%)')
  })
})
