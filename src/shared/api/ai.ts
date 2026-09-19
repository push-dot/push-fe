import { api } from './client'
import { request } from './envelope'
import type { DataEnvelope, ListEnvelope } from './envelope'
import { newIdempotencyKey } from '../lib/id'

export type AiModel = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  label: string
  available: boolean
  supportedEfforts: ('LOW' | 'MEDIUM' | 'HIGH')[]
}

export const listAiModels = async (params?: {
  provider?: string
  credentialMode?: 'MANAGED' | 'BYOK'
}): Promise<ListEnvelope<AiModel>> =>
  request(() =>
    api.get('ai/models', {
      searchParams: {
        ...(params?.provider ? { provider: params.provider } : {}),
        ...(params?.credentialMode ? { credentialMode: params.credentialMode } : {}),
      },
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
