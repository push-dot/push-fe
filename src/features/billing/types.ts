import type { MsgKey } from '@/shared/i18n'

export type { BillingSummary } from './api/schemas'

export type PlanCardDef = {
  id: 'FREE' | 'PRO' | 'ULTRA'
  nameKey: MsgKey
  priceKey: MsgKey | null
  featureKeys: MsgKey[]
}
