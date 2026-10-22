import { describe, expect, it } from 'vitest'
import { REJECTED_BADGE } from '../constants'
import { absoluteUrl, JOB_CATEGORIES, stageBadge, workConditionLines } from '../labels'

describe('labels', () => {
  it('uses push-be job category keys', () => {
    expect(JOB_CATEGORIES.map((c) => c.key)).toEqual(['dev', 'data', 'design', 'plan', 'marketing', 'sales', 'hr', 'ops'])
  })

  it('flattens the workConditions object into rows', () => {
    expect(workConditionLines({ 근무: '주 5일', 복지: ['스톡옵션', '식대'], 빈값: '', 중첩: { a: 1 }, 연봉: 6000 })).toEqual([
      '근무 · 주 5일',
      '복지 · 스톡옵션, 식대',
      '연봉 · 6000',
    ])
    expect(workConditionLines(['주 5일'])).toEqual(['주 5일'])
    expect(workConditionLines(null)).toEqual([])
  })

  it('resolves server-relative image paths against the API origin', () => {
    const base = 'https://push.example/api/v1'
    expect(absoluteUrl('/api/v1/uploads/images/a.png', base)).toBe('https://push.example/api/v1/uploads/images/a.png')
    expect(absoluteUrl('https://cdn.example/a.png', base)).toBe('https://cdn.example/a.png')
    expect(absoluteUrl(null, base)).toBeNull()
  })

  it('maps withdrawn onto the rejected badge until a cancel badge exists', () => {
    const badge = stageBadge('WITHDRAWN')
    expect(badge).toBe(stageBadge('REJECTED'))
    expect(badge).toBe(REJECTED_BADGE)
  })
})
