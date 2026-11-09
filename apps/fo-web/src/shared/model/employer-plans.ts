export const EMPLOYER_PLAN_CARDS = [
  { id: 'BASIC', name: 'Basic', price: '$20', credits: '3,000', blurb: '사용량 · 공고 생성 · 서류 검토' },
  { id: 'PRO', name: 'Pro', price: '$100', credits: '15,000', blurb: '사용량 ↑ · 더 깊이 분석 · 면접 준비 · 담당자 2명' },
  { id: 'ULTRA', name: 'Ultra', price: '$200', credits: '30,000', blurb: '사용량 ↑ · 더 깊이 분석 · 외부 PDF · 담당자 5명' },
] as const

export const showEmployerCheckout = (audience: 'PERSONAL' | 'EMPLOYER' | undefined): boolean =>
  audience !== 'PERSONAL'

export const canChangeEmployerPlan = (role: 'ADMIN' | 'MEMBER' | undefined, companyMissing: boolean): boolean =>
  role === 'ADMIN' || (companyMissing && role === undefined)

// push-be takes 1 to 20 packs of 1,500 credits per top-up.
export const topupReady = (packs: number): boolean => Number.isInteger(packs) && packs >= 1 && packs <= 20

export const checkoutTarget = (url: string, currentHref: string) => {
  const next = new URL(url, currentHref)
  const current = new URL(currentHref)
  if (next.origin !== current.origin) return { stay: false as const, href: next.href }
  return { stay: true as const, href: `${next.pathname}${next.search}` }
}
