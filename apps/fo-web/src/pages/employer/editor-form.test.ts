import { describe, expect, it } from 'vitest'

import { careerRangeOf, nextBullet, stripBullets, withBullets } from './editor-form'

describe('editor bullets', () => {
  it('adds one bullet per line and takes them off again', () => {
    const shown = withBullets('설계해요\n\n· 이미 있어요')
    expect(shown).toBe('· 설계해요\n· 이미 있어요')
    expect(stripBullets(shown)).toEqual(['설계해요', '이미 있어요'])
  })

  it('starts the next bullet at the caret', () => {
    expect(nextBullet('· 하나', 4)).toEqual({ value: '· 하나\n· ', caret: 7 })
  })
})

describe('careerRangeOf', () => {
  it('picks the range a career fits and the closest one below otherwise', () => {
    expect(careerRangeOf(0).label).toBe('신입')
    expect(careerRangeOf(4).label).toBe('4–6년')
    expect(careerRangeOf(5).label).toBe('4–6년')
    expect(careerRangeOf(12).label).toBe('10년+')
  })
})
