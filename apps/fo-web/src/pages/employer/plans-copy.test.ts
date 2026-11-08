import { describe, expect, it } from 'vitest'
import { ledgerAmount, ledgerDate, planPaid, planSwitchLabel, planUsedPercent } from './constants'

describe('plan switch label', () => {
  it('picks the josa by the last sound of the plan name', () => {
    expect(planSwitchLabel('Basic', false, false, true)).toBe('Basic으로 바꾸기')
    expect(planSwitchLabel('Pro', false, false, true)).toBe('Pro로 바꾸기')
    expect(planSwitchLabel('Ultra', false, true, true)).toBe('Ultra로 올리기')
  })

  it('keeps the current and first-subscription copy', () => {
    expect(planSwitchLabel('Pro', true, false, true)).toBe('지금 쓰는 중')
    expect(planSwitchLabel('Pro', false, false, false)).toBe('구독하기')
  })

  it('names the new plan in the paid toast', () => {
    expect(planPaid('Ultra')).toBe('결제를 마쳤어요. 이제 Ultra를 써요')
    expect(planPaid('Basic')).toBe('결제를 마쳤어요. 이제 Basic을 써요')
  })
})

describe('plan usage percent', () => {
  it('is spent over the monthly credits, rounded and clamped', () => {
    expect(planUsedPercent(9_840_000, 15_000_000)).toBe(66)
    expect(planUsedPercent(9_900_000, 30_000_000)).toBe(33)
    expect(planUsedPercent(40_000_000, 30_000_000)).toBe(100)
    expect(planUsedPercent(0, 0)).toBe(0)
  })
})

describe('ledger copy', () => {
  it('shows the credits a row moved and the day it happened', () => {
    expect(ledgerAmount('PURCHASE', 15_000_000)).toBe('+15,000 크레딧')
    expect(ledgerAmount('REFUND', -3_000_000)).toBe('-3,000 크레딧')
    expect(ledgerDate('2026-10-01T00:00:00.000Z')).toBe('2026년 10월 1일')
  })
})
