import type { BillingStatus } from '@push/api-client'
import { useCompanyBilling, usePaymentsOpen } from '../../entities/billing'
import { useEmployerPlan } from '../../entities/company'
import { PLAN_NAME } from '../../shared/model/employer-plan'

export type ChatUsage = { plan: string; percent: number; full: boolean; topup: boolean }

export const usedPercent = (billing: Pick<BillingStatus, 'monthlyMicroCredits' | 'spentMicroCredits' | 'balanceMicroCredits'>) => {
  const { monthlyMicroCredits: monthly, spentMicroCredits: spent, balanceMicroCredits: balance } = billing
  // Nothing left means the month is used up, whatever top-ups made the spend exceed or trail the grant.
  if (balance <= 0) return 100
  if (monthly <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((spent / monthly) * 100)))
}

export const useChatUsage = (): ChatUsage | null => {
  const { plan } = useEmployerPlan()
  const billing = useCompanyBilling()
  const topup = usePaymentsOpen()
  if (!billing.data) return null
  const percent = usedPercent(billing.data)
  return { plan: plan ? `기업 ${PLAN_NAME[plan]}` : '기업', percent, full: percent >= 100 || billing.data.balanceMicroCredits <= 0, topup }
}
