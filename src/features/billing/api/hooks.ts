import { useMutation, useQuery } from '@tanstack/react-query'
import { createBillingPortal, createCheckout, fetchBilling } from './fetchers'

const keys = {
  summary: ['billing'] as const,
}

export const useBilling = () => useQuery({ queryKey: keys.summary, queryFn: fetchBilling })

export const useCheckout = () =>
  useMutation({ mutationFn: (planId: 'PRO' | 'ULTRA') => createCheckout(planId) })

export const useBillingPortal = () =>
  useMutation({ mutationFn: () => createBillingPortal() })
