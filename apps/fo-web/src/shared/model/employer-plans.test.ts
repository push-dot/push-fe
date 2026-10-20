import { describe, expect, it } from 'vitest'
import { EMPLOYER_PLAN_CARDS, canChangeEmployerPlan, showEmployerCheckout, topupReady } from './employer-plans'

const FORBIDDEN_MODEL_NAMES = ['Sonnet', 'Opus', 'Fable']

describe('employer plan cards', () => {
  it('prices Basic at $20, Pro at $100, and Ultra at $200', () => {
    expect(EMPLOYER_PLAN_CARDS).toEqual([
      { id: 'BASIC', name: 'Basic', price: '$20', credits: '3,000', blurb: '사용량 · 공고 생성 · 서류 검토' },
      { id: 'PRO', name: 'Pro', price: '$100', credits: '15,000', blurb: '사용량 ↑ · 더 깊이 분석 · 면접 준비 · 담당자 2명' },
      { id: 'ULTRA', name: 'Ultra', price: '$200', credits: '30,000', blurb: '사용량 ↑ · 더 깊이 분석 · 외부 PDF · 담당자 5명' },
    ])
  })

  it('names two seats on Pro and five seats on Ultra', () => {
    expect(EMPLOYER_PLAN_CARDS.find((card) => card.id === 'PRO')?.blurb).toContain('담당자 2명')
    expect(EMPLOYER_PLAN_CARDS.find((card) => card.id === 'ULTRA')?.blurb).toContain('담당자 5명')
  })

  it('keeps model names out of every blurb', () => {
    for (const card of EMPLOYER_PLAN_CARDS) {
      for (const name of FORBIDDEN_MODEL_NAMES) {
        expect(card.blurb.includes(name)).toBe(false)
      }
    }
  })
})

describe('canChangeEmployerPlan', () => {
  it('lets an admin or a missing company change the plan, and blocks a member', () => {
    expect(canChangeEmployerPlan('ADMIN', false)).toBe(true)
    expect(canChangeEmployerPlan(undefined, true)).toBe(true)
    expect(canChangeEmployerPlan('MEMBER', false)).toBe(false)
    expect(canChangeEmployerPlan(undefined, false)).toBe(false)
  })
})

describe('topupReady', () => {
  it('accepts only a positive finite amount', () => {
    expect(topupReady(1)).toBe(true)
    expect(topupReady(0.5)).toBe(true)
    expect(topupReady(0)).toBe(false)
    expect(topupReady(-1)).toBe(false)
    expect(topupReady(Number.NaN)).toBe(false)
    expect(topupReady(Number.POSITIVE_INFINITY)).toBe(false)
  })
})

describe('showEmployerCheckout', () => {
  it('hides checkout for a personal audience', () => {
    expect(showEmployerCheckout('PERSONAL')).toBe(false)
  })

  it('shows checkout for an employer audience and when audience is missing', () => {
    expect(showEmployerCheckout('EMPLOYER')).toBe(true)
    expect(showEmployerCheckout(undefined)).toBe(true)
  })
})
