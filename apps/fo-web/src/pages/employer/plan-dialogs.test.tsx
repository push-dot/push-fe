// @vitest-environment happy-dom
import type { LedgerEntry } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { LedgerDialog } from './plan-dialogs'
import { LEDGER_EMPTY } from './constants'

const billingLedger = vi.hoisted(() => vi.fn())

vi.mock('../../shared/api/operations', async () => {
  const actual = await vi.importActual<typeof import('../../shared/api/operations')>(
    '../../shared/api/operations',
  )
  return { ...actual, billingLedger }
})

const writeOff = (id: string): LedgerEntry => ({
  id,
  type: 'WRITE_OFF',
  amountMicroCredits: 1_000,
  balanceAfter: 0,
  referenceId: null,
  createdAt: '2026-10-02T00:00:00.000Z',
  description: null,
  amountUsd: null,
  receiptUrl: null,
})

const payment: LedgerEntry = {
  id: 'pay-1',
  type: 'PURCHASE',
  amountMicroCredits: 0,
  balanceAfter: 0,
  referenceId: 'cs_1',
  createdAt: '2026-10-01T00:00:00.000Z',
  description: 'Pro 월 구독',
  amountUsd: 100,
  receiptUrl: 'https://pay.stripe.com/receipts/mock',
}

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
        <LedgerDialog company="모아페이" onClose={() => undefined} />
      </QueryClientProvider>,
    )
  })
  return { container, root }
}

describe('ledger dialog', () => {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  afterEach(() => {
    act(() => root?.unmount())
    container?.remove()
    vi.clearAllMocks()
  })

  it('pages through 50 write-off rows to the payment', async () => {
    billingLedger.mockImplementation(async (query?: { cursor?: string }) => {
      if (!query?.cursor) {
        return {
          data: Array.from({ length: 50 }, (_, index) => writeOff(`w-${index}`)),
          page: { nextCursor: 'p2', hasMore: true, total: 51 },
        }
      }
      return { data: [payment], page: { nextCursor: null, hasMore: false, total: 51 } }
    })
    ;({ container, root } = mount())
    let html = ''
    for (let attempt = 0; attempt < 20 && !html.includes('Pro 월 구독'); attempt += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      html = container?.innerHTML ?? ''
    }
    expect(billingLedger).toHaveBeenCalledTimes(2)
    expect(billingLedger.mock.calls[1]?.[0]).toMatchObject({ cursor: 'p2' })
    expect(html).toContain('Pro 월 구독')
    expect(html).toContain('$100')
    expect(html).not.toContain(LEDGER_EMPTY)
  })
})
