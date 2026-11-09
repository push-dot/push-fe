import { describe, expect, it } from 'vitest'
import { tabBarShown, tabItems, tabOn } from './tab-items'

describe('bottom tab bar', () => {
  it('lists the board items per account', () => {
    expect(tabItems('personal').map((item) => item.label)).toEqual(['홈', '채용공고', '허브', '소셜', '마이'])
    expect(tabItems('employer').map((item) => item.label)).toEqual(['홈', '채용공고', '허브', '소셜', '에이전트', '공고 관리'])
    expect(tabItems('guest').filter((item) => item.lock).map((item) => item.label)).toEqual(['허브', '소셜'])
  })

  it('selects the section of the route, nothing on inbox, search and account pages', () => {
    expect(tabOn('/notifications', '/')).toBe(true)
    expect(tabOn('/posts/p1', '/social')).toBe(true)
    expect(tabOn('/settings', '/me')).toBe(true)
    expect(tabOn('/employer/postings/p1/applicants', '/employer/postings')).toBe(true)
    for (const path of ['/offers', '/search', '/employer/plans', '/terms']) {
      expect(tabItems('employer').some((item) => tabOn(path, item.to))).toBe(false)
    }
  })

  it('gives way to the sticky action bar on detail and editor pages', () => {
    expect(tabBarShown('/postings/p1')).toBe(false)
    expect(tabBarShown('/employer/postings/p1/applicants/a1')).toBe(false)
    expect(tabBarShown('/employer/postings/p1/applicants')).toBe(true)
    expect(tabBarShown('/offers')).toBe(true)
  })
})
