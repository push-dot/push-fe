// @vitest-environment happy-dom
import type { CompanyBillingStatus } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { rememberCheckoutBalance } from '../../shared/model/employer-plans'
import PlansPage from './plans-page'

const billingCompanyStatus = vi.hoisted(() => vi.fn())

vi.mock('../../shared/api/operations', async () => {
  const actual = await vi.importActual<typeof import('../../shared/api/operations')>(
    '../../shared/api/operations',
  )
  return {
    ...actual,
    billingCompanyStatus,
    companiesMe: async () => {
      throw new Error('no company')
    },
    companiesMembers: async () => [],
  }
})

const billing = (balanceMicroCredits: number): CompanyBillingStatus => ({
  plan: 'PRO',
  audience: 'EMPLOYER',
  balanceMicroCredits,
  subscriptionStatus: 'active',
  periodEndsAt: '2026-11-01T00:00:00.000Z',
  reservedMicroCredits: 0,
  monthlyMicroCredits: 15_000_000,
  spentMicroCredits: 0,
  paymentsEnabled: true,
})

const tick = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })

const mount = () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  })
  act(() => {
    root.render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/employer/plans?checkout=credits']}>
          <PlansPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  })
  return { container, root }
}

describe('plans checkout refresh', () => {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  afterEach(() => {
    act(() => root?.unmount())
    container?.remove()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('stops reading and clears the timeout when the page unmounts', async () => {
    billingCompanyStatus.mockImplementation(async () => billing(100))
    rememberCheckoutBalance(100)
    const clear = vi.spyOn(window, 'clearTimeout')
    ;({ container, root } = mount())
    for (let attempt = 0; attempt < 10 && billingCompanyStatus.mock.calls.length < 1; attempt += 1)
      await tick()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
    const started = billingCompanyStatus.mock.calls.length
    expect(started).toBeGreaterThan(0)
    await act(() => {
      root?.unmount()
      root = undefined
    })
    expect(clear).toHaveBeenCalled()
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })
    expect(billingCompanyStatus.mock.calls.length).toBe(started)
  })

  it('keeps reading a credit return with an empty cache until the balance passes the remembered one', async () => {
    const seen: number[] = []
    billingCompanyStatus.mockImplementation(async () => {
      const balanceMicroCredits = seen.length < 2 ? 100 : 250
      seen.push(balanceMicroCredits)
      return billing(balanceMicroCredits)
    })
    rememberCheckoutBalance(100)
    ;({ container, root } = mount())
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2_500))
    })
    expect(seen).toContain(100)
    expect(seen).toContain(250)
    expect(seen.at(-1)).toBe(250)
    const stopped = billingCompanyStatus.mock.calls.length
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600))
    })
    expect(billingCompanyStatus.mock.calls.length).toBe(stopped)
  })
})
