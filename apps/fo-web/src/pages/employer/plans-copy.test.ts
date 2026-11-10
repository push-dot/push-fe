import { describe, expect, it } from 'vitest'
import type { LedgerEntry } from '@push/api-client'
import { buyTotal, ledgerDate, ledgerNeedsAnotherPage, ledgerPayments, ledgerShowsMore, ledgerUsd, ledgerView, planPaid, planSwitchLabel, planUsedPercent, planViewerBody } from './constants'

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
    expect(planPaid()).toBe('결제를 마쳤어요')
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

const row = (patch: Partial<LedgerEntry>): LedgerEntry => ({
  id: 'r',
  type: 'PURCHASE',
  amountMicroCredits: 0,
  balanceAfter: 0,
  referenceId: null,
  createdAt: '2026-10-01T00:00:00.000Z',
  description: null,
  amountUsd: null,
  receiptUrl: null,
  ...patch,
})

describe('ledger rows', () => {
  it('keeps only Stripe payments, in the order the server sent them', () => {
    const rows = ledgerPayments([
      row({ id: 'b', description: 'Pro 월 구독', amountUsd: 100, receiptUrl: 'https://r/b' }),
      row({ id: 'grant', amountMicroCredits: 15_000_000, referenceId: 'monthly:2026-10:PRO' }),
      row({ id: 'a', description: 'Basic 월 구독', amountUsd: 20, createdAt: '2026-07-01T00:00:00.000Z' }),
      row({ id: 'w', type: 'WRITE_OFF', amountMicroCredits: 120_000 }),
    ])
    expect(rows.map((item) => item.id)).toEqual(['b', 'a'])
    expect(rows[0]).toMatchObject({ title: 'Pro 월 구독', receiptUrl: 'https://r/b' })
  })

  it('reads 환불 on a refund row and puts the minus before the dollar sign', () => {
    const [refund] = ledgerPayments([row({ type: 'REFUND', amountUsd: -10, amountMicroCredits: -15_000_000 })])
    expect(refund?.title).toBe('환불')
    expect(ledgerUsd(-10)).toBe('-$10')
    expect(ledgerUsd(100)).toBe('$100')
    expect(ledgerUsd(12.5)).toBe('$12.50')
  })

  it('skips a row whose amountUsd is missing instead of drawing $NaN', () => {
    const { amountUsd: _, ...noUsd } = row({ id: 'old' })
    expect(ledgerPayments([noUsd as LedgerEntry])).toEqual([])
  })

  it('writes the day in Korean', () => {
    expect(ledgerDate('2026-10-01T00:00:00.000Z')).toBe('2026년 10월 1일')
  })

  it('keeps paging while the loaded pages have no payments, so the empty state and 더 보기 never show together', () => {
    const base = {
      isError: false,
      isPending: false,
      isFetchingNextPage: false,
      isFetchNextPageError: false,
    }
    const emptyPage = { ...base, hasNextPage: true, paymentCount: 0 }
    const done = { ...base, hasNextPage: false, paymentCount: 0 }
    const paid = { ...base, hasNextPage: true, paymentCount: 2 }
    expect(ledgerNeedsAnotherPage(0, true)).toBe(true)
    expect(ledgerView(emptyPage)).toBe('loading')
    expect(ledgerShowsMore(emptyPage.paymentCount, emptyPage.hasNextPage)).toBe(false)
    expect(ledgerView(done)).toBe('empty')
    expect(ledgerShowsMore(done.paymentCount, done.hasNextPage)).toBe(false)
    expect(ledgerView(paid)).toBe('rows')
    expect(ledgerShowsMore(paid.paymentCount, paid.hasNextPage)).toBe(true)
    expect(ledgerView({ ...emptyPage, isFetchNextPageError: true })).toBe('error')
    for (const state of [emptyPage, done, paid]) {
      expect(
        ledgerView(state) === 'empty' && ledgerShowsMore(state.paymentCount, state.hasNextPage),
      ).toBe(false)
    }
  })
})

describe('credit purchase', () => {
  it('prices packs at 1,500 credits and $10 each', () => {
    expect(buyTotal(1)).toBe('1,500크레딧 · $10')
    expect(buyTotal(20)).toBe('30,000크레딧 · $200')
  })

  it('names the admin to ask when the member knows them', () => {
    expect(planViewerBody('이민아')).toBe(
      '바꾸거나 크레딧을 사려면 관리자 이민아 님에게 말해 주세요.',
    )
    expect(planViewerBody()).toBe('바꾸거나 크레딧을 사려면 관리자에게 말해 주세요.')
  })
})
