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

// The success return names no plan and the webhook may land after it, so the page remembers which plan was bought.
const CHECKOUT_PLAN = 'push.checkoutPlan'
export const rememberCheckoutPlan = (planId: string | null) => {
  const store = browserSessionStorage()
  if (planId) store?.setItem(CHECKOUT_PLAN, planId)
  else store?.removeItem(CHECKOUT_PLAN)
}
export const checkoutPlanName = () => EMPLOYER_PLAN_CARDS.find((card) => card.id === browserSessionStorage()?.getItem(CHECKOUT_PLAN))?.name

export const checkoutTarget = (url: string, currentHref: string) => {
  const next = new URL(url, currentHref)
  const current = new URL(currentHref)
  if (next.origin !== current.origin) return { stay: false as const, href: next.href }
  return { stay: true as const, href: `${next.pathname}${next.search}` }
}
