import { ApiError } from '@push/api-client'
import type { ChatIntent } from '../../shared/model/employer-chat'

export type ChatBlock = 'interview' | 'pdf' | 'verify' | 'failed'

export const isChatIntent = (value: unknown): value is ChatIntent =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general'

export const chatGateFrom = (error: unknown): ChatBlock => {
  if (error instanceof ApiError && error.code === 'BUSINESS_NOT_VERIFIED') return 'verify'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'ULTRA') return 'pdf'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'PRO') return 'interview'
  return 'failed'
}

export const chatRouteState = (value: unknown) => {
  const record = value && typeof value === 'object' ? (value as { intent?: unknown; postingId?: unknown }) : {}
  return {
    intent: isChatIntent(record.intent) ? record.intent : ('general' as const),
    postingId: typeof record.postingId === 'string' && record.postingId ? record.postingId : undefined,
  }
}
