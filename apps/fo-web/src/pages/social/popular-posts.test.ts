import type { Post } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { POPULAR_PARAMS, topByViews } from './popular-posts'

const post = (id: string, viewCount: number) => ({ id, viewCount }) as Post

describe('topByViews', () => {
  it('keeps the three most viewed posts, most viewed first', () => {
    expect(topByViews([post('a', 10), post('b', 2400), post('c', 980), post('d', 1200)]).map((p) => p.id)).toEqual(['b', 'd', 'c'])
  })

  it('does not reorder the list it was given', () => {
    const list = [post('a', 1), post('b', 5)]
    topByViews(list)
    expect(list.map((p) => p.id)).toEqual(['a', 'b'])
  })
})

describe('POPULAR_PARAMS', () => {
  it('asks push-be for this week, as the 이번 주 많이 본 글 title says', () => {
    expect(POPULAR_PARAMS).toMatchObject({ sort: 'popular', period: 'week' })
  })
})
