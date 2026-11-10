import { describe, expect, it } from 'vitest'
import { invalidFields } from './compose-fields'

describe('invalidFields', () => {
  it('flags the empty body of an otherwise filled post', () => {
    expect(invalidFields({ category: 'dev', title: '정산 배치 이야기', body: '   ' })).toEqual({ category: false, title: false, body: true })
  })

  it('flags a missing category and an over-long title', () => {
    expect(invalidFields({ category: '', title: 'a'.repeat(101), body: '내용' })).toEqual({ category: true, title: true, body: false })
  })

  it('accepts a complete post', () => {
    expect(invalidFields({ category: 'career', title: '제목', body: '내용' })).toEqual({ category: false, title: false, body: false })
  })
})
