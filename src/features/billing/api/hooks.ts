import { useQuery } from '@tanstack/react-query'
import { fetchBilling } from './fetchers'

const keys = {
  summary: ['billing'] as const,
}

export const useBilling = () =>
  useQuery({ queryKey: keys.summary, queryFn: fetchBilling })
