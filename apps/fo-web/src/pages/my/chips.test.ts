import { describe, expect, it } from 'vitest'
import { EMPLOYER_ACTIVITY_CHIPS, EMPLOYER_MY_TABS, PERSONAL_ACTIVITY_CHIPS, PERSONAL_MY_TABS } from './constants'

describe('my tabs and chips', () => {
  it('keeps 서류 and 지원활동 on personal accounts and off employer accounts', () => {
    expect(EMPLOYER_MY_TABS[0]).toBe('회사 정보')
    expect(EMPLOYER_MY_TABS).not.toContain('서류')
    expect(EMPLOYER_ACTIVITY_CHIPS).not.toContain('지원활동')
    expect(PERSONAL_MY_TABS).toContain('서류')
    expect(PERSONAL_ACTIVITY_CHIPS).toContain('지원활동')
  })
})
