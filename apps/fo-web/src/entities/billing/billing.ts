import { useQuery } from '@tanstack/react-query'
import { billingCompanyStatus as fetchCompanyBilling, billingLedger } from '../../shared/api/operations'
import { paymentsOpen } from '../../shared/model/employer-plans'

export const billingCompanyStatus = (...args: Parameters<typeof fetchCompanyBilling>) => fetchCompanyBilling(...args)

export const useCompanyBilling = () =>
  useQuery({ queryKey: ['billing', 'company'], queryFn: () => billingCompanyStatus() })

/** False until billing loads, so nothing offers a payment on a guess. */
export const usePaymentsOpen = () => paymentsOpen(useCompanyBilling().data)

export const useBillingLedger = () => useQuery({ queryKey: ['billing', 'ledger'], queryFn: () => billingLedger() })
