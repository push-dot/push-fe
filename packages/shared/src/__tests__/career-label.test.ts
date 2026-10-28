import { describe, expect, it } from 'vitest'
import { careerLabel } from '../index'

describe('careerLabel', () => {
  it('returns the short form', () => {
    expect(careerLabel({ careerMin: 0, careerMax: null })).toBe('신입')
    expect(careerLabel({ careerMin: 4, careerMax: 6 })).toBe('4–6년')
    expect(careerLabel({ careerMin: 4, careerMax: null })).toBe('4년+')
  })
})
