import { describe, expect, it } from 'vitest'
import { REJECTED_BADGE } from '../constants'
import { absoluteUrl, HUB_CATEGORIES, JOB_CATEGORIES, TENURES, stageBadge, workConditionLines } from '../labels'

describe('labels', () => {
  it('uses push-be job category keys', () => {
    expect(JOB_CATEGORIES.map((c) => c.key)).toEqual(['dev', 'data', 'design', 'plan', 'marketing', 'sales', 'hr', 'ops'])
  })

  it('puts 데이터 fifth on hub chips', () => {
    expect(HUB_CATEGORIES.map((c) => c.label)).toEqual(['개발', '디자인', '기획', '마케팅', '데이터', '영업'])
  })

  it('offers the five hub tenure buckets from the board', () => {
    expect(TENURES.map((item) => item.key)).toEqual(['0', '1-2', '3-5', '6-9', '10+'])
    expect(TENURES.map((item) => item.label)).toEqual(['신입', '1–2년', '3–5년', '6–9년', '10년+'])
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
