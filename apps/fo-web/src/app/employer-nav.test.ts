import { describe, expect, it } from 'vitest'
import { NAV } from './constants'
import { EMPLOYER_LINKS } from './shell-links'

describe('employer header links', () => {
  it('places 기업 AI before 공고 관리', () => {
    expect(EMPLOYER_LINKS.map((link) => link.label)).toEqual([NAV.chat, NAV.postings])
    expect(NAV.chat).toBe('기업 AI')
    expect(NAV.postings).toBe('공고 관리')
    expect(EMPLOYER_LINKS.map((link) => link.to)).toEqual(['/employer/chat', '/employer/postings'])
  })
})
