import type { Company, CompanyBillingStatus } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import PlansPage from './plans-page'
import { PAYMENTS_CLOSED, PLAN_VIEWER_TITLE } from './constants'

const billing = (paymentsEnabled?: boolean): CompanyBillingStatus => ({
  plan: 'PRO',
  audience: 'EMPLOYER',
  balanceMicroCredits: 5_160_000,
  subscriptionStatus: 'active',
  periodEndsAt: '2026-11-01T00:00:00.000Z',
  reservedMicroCredits: 0,
  monthlyMicroCredits: 15_000_000,
  spentMicroCredits: 9_840_000,
  ...(paymentsEnabled === undefined ? {} : { paymentsEnabled }),
})

const company = (role: Company['role']): Company => ({
  id: 'co-1',
  bNo: '2148703921',
  name: '모아페이',
  plan: 'PRO',
  verifiedAt: '2026-09-01T00:00:00.000Z',
  role,
  seats: { used: 1, limit: 2 },
})

const render = (role: Company['role'], paymentsEnabled?: boolean) => {
  const client = new QueryClient()
  client.setQueryData(['billing', 'company'], billing(paymentsEnabled))
  client.setQueryData(['company', 'me'], company(role))
  client.setQueryData(['company', 'members'], [])
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/employer/plans']}>
        <PlansPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

// The <button> whose label is `label`, or undefined when the page leaves it out.
const button = (html: string, label: string) => html.match(new RegExp(`<button[^>]*>(?:(?!</button>).)*${label}</button>`))?.[0]

describe('plans page canPay = canManage && paymentsOpen', () => {
  it('lets an admin buy and switch while payments are open', () => {
    const html = render('ADMIN', true)
    expect(button(html, '구매')).not.toContain('disabled')
    expect(button(html, 'Ultra로 올리기')).not.toContain('disabled')
    expect(html).not.toContain(PAYMENTS_CLOSED)
  })

  it('keeps an old server without paymentsEnabled open', () => {
    expect(button(render('ADMIN'), '구매')).not.toContain('disabled')
  })

  it('hides 구매, disables the plan buttons and says why when payments are closed', () => {
    const html = render('ADMIN', false)
    expect(button(html, '구매')).toBeUndefined()
    expect(button(html, 'Ultra로 올리기')).toContain('disabled')
    expect(html).toContain(PAYMENTS_CLOSED)
  })

  it('shows a member the disabled actions and the admin-only banner', () => {
    const html = render('MEMBER', true)
    expect(button(html, '구매')).toContain('disabled')
    expect(button(html, 'Ultra로 올리기')).toContain('disabled')
    expect(html).toContain(PLAN_VIEWER_TITLE)
    expect(button(html, '결제 내역')).not.toContain('disabled')
  })
})
