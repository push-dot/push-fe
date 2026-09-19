import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { BillingSummary } from './schemas'

export const fetchBilling = async (): Promise<BillingSummary> => {
  const env = await request<DataEnvelope<BillingSummary>>(() => api.get('billing'))
  return env.data
}

export const createCheckout = async (planId: 'PRO' | 'ULTRA'): Promise<string> => {
  const env = await request<DataEnvelope<{ url: string }>>(() =>
    api.post('billing/checkout', {
      json: { planId },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data.url
}

export const createBillingPortal = async (): Promise<string> => {
  const env = await request<DataEnvelope<{ url: string }>>(() =>
    api.post('billing/portal', {
      json: {},
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data.url
}
