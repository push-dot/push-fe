import { describe, expect, it } from 'vitest'
import { FILTERED_EMPTY, FILTERED_EMPTY_HINT } from './constants'

describe('jobs empty', () => {
  it('filtered empty copy', () => {
    expect([FILTERED_EMPTY, FILTERED_EMPTY_HINT]).toEqual(['조건에 맞는 공고가 없어요.', '필터를 줄여 보세요.'])
  })
})
