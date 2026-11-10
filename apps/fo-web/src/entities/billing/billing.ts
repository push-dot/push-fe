import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { billingCompanyStatus as fetchCompanyBilling, billingLedger } from '../../shared/api/operations'
import { paymentsOpen } from '../../shared/model/employer-plans'

export const billingCompanyStatus = (...args: Parameters<typeof fetchCompanyBilling>) => fetchCompanyBilling(...args)

export const useCompanyBilling = () =>
  useQuery({ queryKey: ['billing', 'company'], queryFn: () => billingCompanyStatus() })

/** False until billing loads, so nothing offers a payment on a guess. */
export const usePaymentsOpen = () => paymentsOpen(useCompanyBilling().data)

// push-be pages the ledger 50 rows at a time.
export const useBillingLedger = () =>
  useInfiniteQuery({
    queryKey: ['billing', 'ledger'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => billingLedger({ cursor: pageParam }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })
