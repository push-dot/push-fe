import { describe, expect, it } from 'vitest'
import { cardCareerLabel, careerLabel } from '../index'

describe('careerLabel', () => {
  it('returns the short form', () => {
    expect(careerLabel({ careerMin: 0, careerMax: null })).toBe('신입')
    expect(careerLabel({ careerMin: 4, careerMax: 6 })).toBe('4–6년')
    expect(careerLabel({ careerMin: 4, careerMax: null })).toBe('4년+')
  })

  it('keeps 7년+ on cards and leaves filter ranges alone', () => {
    expect(cardCareerLabel({ careerMin: 7, careerMax: 9 })).toBe('7년+')
    expect(cardCareerLabel({ careerMin: 7, careerMax: null })).toBe('7년+')
    expect(cardCareerLabel({ careerMin: 10, careerMax: null })).toBe('10년+')
    expect(cardCareerLabel({ careerMin: 4, careerMax: 6 })).toBe('4–6년')
    expect(cardCareerLabel({ careerMin: 0, careerMax: null })).toBe('신입')
    expect(careerLabel({ careerMin: 7, careerMax: 9 })).toBe('7–9년')
  })
})
