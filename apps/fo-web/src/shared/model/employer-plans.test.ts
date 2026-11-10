import { afterEach, describe, expect, it, vi } from 'vitest'
import { EMPLOYER_PLAN_CARDS, canChangeEmployerPlan, checkoutBackoff, checkoutBalance, checkoutPlanId, checkoutPlanName, checkoutReturn, checkoutTarget, paidPlanVisible, paymentsOpen, refreshUntilPaid, rememberCheckoutBalance, rememberCheckoutPlan, showEmployerCheckout, topupReady } from './employer-plans'

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
  it('accepts a whole number of packs from 1 to 20', () => {
    expect(topupReady(1)).toBe(true)
    expect(topupReady(20)).toBe(true)
    expect(topupReady(21)).toBe(false)
    expect(topupReady(0.5)).toBe(false)
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

describe('checkoutTarget', () => {
  it('keeps a same-origin plans url on this site', () => {
    expect(checkoutTarget('/employer/plans?checkout=PRO', 'http://localhost:5175/employer/plans?mock=1')).toEqual({
      stay: true,
      href: '/employer/plans?checkout=PRO',
    })
  })

  it('keeps an absolute localhost plans url on this site', () => {
    expect(
      checkoutTarget('http://localhost:5175/employer/plans?checkout=ULTRA', 'http://localhost:5175/employer/plans?mock=1'),
    ).toEqual({ stay: true, href: '/employer/plans?checkout=ULTRA' })
  })

  it('leaves the site only for a different host', () => {
    expect(checkoutTarget('https://example.test/checkout?plan=PRO', 'http://localhost:5175/employer/plans?mock=1')).toEqual({
      stay: false,
      href: 'https://example.test/checkout?plan=PRO',
    })
  })
})

describe('paymentsOpen', () => {
  it('closes checkout and top-up when the server reports payments off', () => {
    expect(paymentsOpen({ paymentsEnabled: false })).toBe(false)
  })

  it('keeps them open when the server allows payments or predates the flag', () => {
    expect(paymentsOpen({ paymentsEnabled: true })).toBe(true)
    expect(paymentsOpen({})).toBe(true)
  })

  it('keeps them closed until billing loads', () => {
    expect(paymentsOpen(undefined)).toBe(false)
  })
})

describe('Stripe return (push-be billing.ts returnUrls)', () => {
  afterEach(() => vi.unstubAllGlobals())
  const of = (search: string) => checkoutReturn(new URL(`https://push.devcyjoon.tech/employer/plans${search}`).searchParams)

  it('reads success, credits and canceled the way push-be writes them', () => {
    expect(of('?checkout=success&session_id=cs_test_a1')).toBe('success')
    expect(of('?checkout=credits&session_id=cs_test_a1')).toBe('credits')
    expect(of('?checkout=canceled')).toBe('canceled')
    expect(of('?checkout=ULTRA')).toBeNull()
    expect(of('')).toBeNull()
  })

  it('names the plan that was bought from the tab, and nothing once it is cleared', () => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    })
    rememberCheckoutPlan('ULTRA')
    expect(checkoutPlanId()).toBe('ULTRA')
    expect(checkoutPlanName()).toBe('Ultra')
    rememberCheckoutPlan(null)
    expect(checkoutPlanId()).toBeNull()
    expect(checkoutPlanName()).toBeUndefined()
  })

  it('remembers the pre-checkout balance and uses it when the return page has no cache', async () => {
    const store = new Map<string, string>()
    vi.stubGlobal('sessionStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    })
    rememberCheckoutBalance(100)
    expect(checkoutBalance()).toBe(100)
    expect(paidPlanVisible('credits', { plan: 'PRO', balanceMicroCredits: 100 }, null, null)).toBe(false)
    expect(paidPlanVisible('credits', { plan: 'PRO', balanceMicroCredits: 250 }, null, null)).toBe(true)
    const balances = [100, 100, 250]
    const waits: number[] = []
    await refreshUntilPaid(
      'credits',
      null,
      null,
      async () => ({ plan: 'PRO', balanceMicroCredits: balances.shift() ?? 250 }),
      async (ms) => {
        waits.push(ms)
      },
    )
    expect(waits).toEqual([500, 1000])
    rememberCheckoutBalance(null)
    expect(checkoutBalance()).toBeNull()
    expect(paidPlanVisible('credits', { plan: 'PRO', balanceMicroCredits: 10 }, null, null)).toBe(true)
  })
})

describe('checkout billing refresh', () => {
  const billing = (plan: string | null, balanceMicroCredits: number) => ({ plan, balanceMicroCredits })

  it('waits 500, 1000, 2000, then 4000ms and stops after five reads', () => {
    expect(checkoutBackoff(0)).toBe(500)
    expect(checkoutBackoff(1)).toBe(1000)
    expect(checkoutBackoff(2)).toBe(2000)
    expect(checkoutBackoff(3)).toBe(4000)
    expect(checkoutBackoff(4)).toBeNull()
  })

  it('sees the bought plan, and added credits, once billing shows them', () => {
    expect(paidPlanVisible('success', billing('PRO', 1), 'ULTRA', 1)).toBe(false)
    expect(paidPlanVisible('success', billing('ULTRA', 1), 'ULTRA', 1)).toBe(true)
    expect(paidPlanVisible('success', undefined, 'ULTRA', 1)).toBe(false)
    expect(paidPlanVisible('credits', billing('PRO', 100), null, 100)).toBe(false)
    expect(paidPlanVisible('credits', billing('PRO', 250), null, 100)).toBe(true)
    expect(paidPlanVisible('credits', billing('PRO', 10), null, null)).toBe(true)
  })

  it('refetches with backoff until the paid plan shows, and stops when the reads run out', async () => {
    const plans = ['PRO', 'PRO', 'ULTRA']
    const waits: number[] = []
    await refreshUntilPaid('success', 'ULTRA', 1, async () => billing(plans.shift() ?? 'ULTRA', 1), async (ms) => {
      waits.push(ms)
    })
    expect(waits).toEqual([500, 1000])

    let reads = 0
    const bounded: number[] = []
    await refreshUntilPaid(
      'success',
      'ULTRA',
      1,
      async () => {
        reads += 1
        return billing('PRO', 1)
      },
      async (ms) => {
        bounded.push(ms)
      },
    )
    expect(reads).toBe(5)
    expect(bounded).toEqual([500, 1000, 2000, 4000])
  })

  it('retries a failed read, and stops when the page is gone', async () => {
    let reads = 0
    const waits: number[] = []
    await refreshUntilPaid(
      'credits',
      null,
      100,
      async () => {
        reads += 1
        if (reads === 1) throw new Error('offline')
        return billing('PRO', 250)
      },
      async (ms) => {
        waits.push(ms)
      },
    )
    expect(waits).toEqual([500])

    let after = 0
    await refreshUntilPaid('success', 'ULTRA', 1, async () => {
      after += 1
      return billing('PRO', 1)
    }, async () => undefined, () => false)
    expect(after).toBe(0)
  })
})
