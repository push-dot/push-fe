import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { AiModel } from './schemas'

export const listAiModels = async (params?: {
  provider?: string
  credentialMode?: 'MANAGED' | 'BYOK'
  byokKey?: string
}): Promise<ListEnvelope<AiModel>> =>
  request(() =>
    api.get('ai/models', {
      searchParams: {
        ...(params?.provider ? { provider: params.provider } : {}),
        ...(params?.credentialMode ? { credentialMode: params.credentialMode } : {}),
      },
      headers: params?.byokKey ? { 'X-Byok-Key': params.byokKey } : {},
    }),
  )

export type BillingSummary = {
  subscriptionStatus: string
  plan: string
  periodEndsAt: string | null
  balanceMicroCredits: number
  reservedMicroCredits: number
}

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
