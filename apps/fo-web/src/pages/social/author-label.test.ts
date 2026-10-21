import { describe, expect, it } from 'vitest'
import { authorLabel } from './author-label'

describe('authorLabel', () => {
  it('shows the company name for an employer and hides the member name', () => {
    expect(authorLabel({ id: 'u', displayName: '김담당', employer: true, companyName: '모아페이' })).toBe('모아페이')
  })

  it('shows the member name for a person', () => {
    expect(authorLabel({ id: 'u', displayName: '김서준' })).toBe('김서준')
  })
})
