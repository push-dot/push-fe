import { describe, expect, it } from 'vitest'
import { FILTERED_EMPTY } from './constants'

describe('jobs empty', () => {
  it('filtered empty copy', () => {
    expect(FILTERED_EMPTY).toBe('조건에 맞는 공고가 없어요.\n필터를 줄여 보세요.')
  })
})
