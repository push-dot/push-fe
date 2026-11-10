import { describe, expect, it } from 'vitest'
import { FILTERED_EMPTY, FILTERED_EMPTY_HINT, JOB_PAGE_SIZE, JOB_SORTS, SORT_LABEL, sortFrom } from './constants'

describe('jobs empty', () => {
  it('filtered empty copy', () => {
    expect([FILTERED_EMPTY, FILTERED_EMPTY_HINT]).toEqual(['조건에 맞는 공고가 없어요.', '필터를 줄여 보세요.'])
  })
})

describe('jobs list', () => {
  it('pages by 12', () => {
    expect(JOB_PAGE_SIZE).toBe(12)
  })

  it('labels the sort menu as the board does', () => {
    expect(JOB_SORTS.map((key) => SORT_LABEL[key])).toEqual(['최신순', '마감 임박순', '인기순'])
  })

  it('reads ?sort= and falls back to latest', () => {
    expect([sortFrom('deadline'), sortFrom('popular'), sortFrom('x'), sortFrom(null)]).toEqual(['deadline', 'popular', 'latest', 'latest'])
  })
})
