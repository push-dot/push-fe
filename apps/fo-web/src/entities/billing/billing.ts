import { useQuery } from '@tanstack/react-query'
import { billingCompanyStatus as fetchCompanyBilling } from '../../shared/api/operations'

export const billingCompanyStatus = (...args: Parameters<typeof fetchCompanyBilling>) => fetchCompanyBilling(...args)

export const useCompanyBilling = () =>
  useQuery({ queryKey: ['billing', 'company'], queryFn: () => billingCompanyStatus() })
