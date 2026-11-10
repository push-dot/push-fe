import { browserSessionStorage } from '../lib/storage'

export const EMPLOYER_PLAN_CARDS = [
  { id: 'BASIC', name: 'Basic', price: '$20', credits: '3,000', blurb: '사용량 · 공고 생성 · 서류 검토' },
  { id: 'PRO', name: 'Pro', price: '$100', credits: '15,000', blurb: '사용량 ↑ · 더 깊이 분석 · 면접 준비 · 담당자 2명' },
  { id: 'ULTRA', name: 'Ultra', price: '$200', credits: '30,000', blurb: '사용량 ↑ · 더 깊이 분석 · 외부 PDF · 담당자 5명' },
] as const

export const showEmployerCheckout = (audience: 'PERSONAL' | 'EMPLOYER' | undefined): boolean =>
  audience !== 'PERSONAL'

export const canChangeEmployerPlan = (role: 'ADMIN' | 'MEMBER' | undefined, companyMissing: boolean): boolean =>
  role === 'ADMIN' || (companyMissing && role === undefined)

// Servers before push-be #246 send no paymentsEnabled and keep payments open. No billing data at all (loading, error) stays closed.
export const paymentsOpen = (billing: { paymentsEnabled?: boolean } | undefined): boolean =>
  billing !== undefined && billing.paymentsEnabled !== false

// push-be takes 1 to 20 packs of 1,500 credits per top-up.
export const topupReady = (packs: number): boolean => Number.isInteger(packs) && packs >= 1 && packs <= 20

// push-be sends Stripe back to /employer/plans?checkout=success|credits&session_id=… or ?checkout=canceled.
export const checkoutReturn = (params: URLSearchParams) => {
  const value = params.get('checkout')
  return value === 'success' || value === 'credits' || value === 'canceled' ? value : null
}

// The success return names no plan and the webhook may land after it, so the tab remembers which plan it sent to Stripe.
const CHECKOUT_PLAN = 'push.checkoutPlan'
const CHECKOUT_PLAN_IDS = ['BASIC', 'PRO', 'ULTRA'] as const
export type CheckoutPlanId = (typeof CHECKOUT_PLAN_IDS)[number]

export const rememberCheckoutPlan = (planId: string | null) => {
  const store = browserSessionStorage()
  if (planId) store?.setItem(CHECKOUT_PLAN, planId)
  else store?.removeItem(CHECKOUT_PLAN)
}

export const checkoutPlanId = (): CheckoutPlanId | null => {
  const stored = browserSessionStorage()?.getItem(CHECKOUT_PLAN) ?? null
  return CHECKOUT_PLAN_IDS.find((id) => id === stored) ?? null
}

export const checkoutPlanName = () => EMPLOYER_PLAN_CARDS.find((card) => card.id === checkoutPlanId())?.name

// The webhook can land after Stripe sends the browser back. Read billing a few times, then stop.
export const CHECKOUT_READS = 5

/** Milliseconds before the next billing read, or null when this read was the last. */
export const checkoutBackoff = (attempt: number): number | null => (attempt >= CHECKOUT_READS - 1 ? null : 500 * 2 ** attempt)

export const paidPlanVisible = (
  kind: 'success' | 'credits',
  billing: { plan: string | null; balanceMicroCredits: number } | undefined,
  pendingPlan: string | null,
  balanceBefore: number | null,
) => {
  if (!billing) return false
  if (kind === 'credits') return balanceBefore === null || billing.balanceMicroCredits > balanceBefore
  return pendingPlan === null || billing.plan === pendingPlan
}

/**
 * Refetch until the bought plan (or the added credits) shows, with bounded backoff.
 * `alive` lets the page stop the loop when it unmounts. A read that throws counts as not yet visible.
 */
export const refreshUntilPaid = async (
  kind: 'success' | 'credits',
  pendingPlan: string | null,
  balanceBefore: number | null,
  read: () => Promise<{ plan: string | null; balanceMicroCredits: number } | undefined>,
  wait: (ms: number) => Promise<void>,
  alive: () => boolean = () => true,
) => {
  for (let attempt = 0; ; attempt += 1) {
    if (!alive()) return
    let billing: { plan: string | null; balanceMicroCredits: number } | undefined
    try {
      billing = await read()
    } catch {
      billing = undefined
    }
    if (!alive() || paidPlanVisible(kind, billing, pendingPlan, balanceBefore)) return
    const delay = checkoutBackoff(attempt)
    if (delay === null) return
    await wait(delay)
  }
}

export const checkoutTarget = (url: string, currentHref: string) => {
  const next = new URL(url, currentHref)
  const current = new URL(currentHref)
  if (next.origin !== current.origin) return { stay: false as const, href: next.href }
  return { stay: true as const, href: `${next.pathname}${next.search}` }
}
