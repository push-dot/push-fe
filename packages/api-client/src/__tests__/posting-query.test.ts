import { describe, expect, it } from 'vitest'
import { withDeadlineWindow } from '../posting-query'

describe('withDeadlineWindow', () => {
  it('limits the deadline sort to every posting due within 7 days', () => {
    expect(withDeadlineWindow({ sort: 'deadline', limit: 10 })).toEqual({ sort: 'deadline', limit: 10, deadlineWithin: '7' })
    expect(withDeadlineWindow({ sort: 'latest' })).toEqual({ sort: 'latest' })
    expect(withDeadlineWindow({ sort: 'popular' })).toEqual({ sort: 'popular' })
  })
})
