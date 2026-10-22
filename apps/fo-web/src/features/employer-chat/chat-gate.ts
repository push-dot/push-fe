import { ApiError } from '@push/api-client'
import type { ChatIntent } from '../../shared/model/employer-chat'
import { HTTP_TOO_MANY_REQUESTS } from './constants'

export type ChatBlock = 'interview' | 'pdf' | 'verify' | 'credits' | 'busy' | 'failed'

export const isChatIntent = (value: unknown): value is ChatIntent =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general'

export const chatGateFrom = (error: unknown): ChatBlock => {
  if (error instanceof ApiError && error.code === 'BUSINESS_NOT_VERIFIED') return 'verify'
  if (error instanceof ApiError && error.code === 'INSUFFICIENT_CREDITS') return 'credits'
  if (error instanceof ApiError && error.status === HTTP_TOO_MANY_REQUESTS) return 'busy'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'ULTRA') return 'pdf'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'PRO') return 'interview'
  return 'failed'
}

export type ApprovalFailure = 'resolved' | 'expired' | 'failed'

export const approvalFailureFrom = (error: unknown): ApprovalFailure => {
  if (error instanceof ApiError && error.code === 'APPROVAL_ALREADY_RESOLVED') return 'resolved'
  if (error instanceof ApiError && error.code === 'APPROVAL_EXPIRED') return 'expired'
  return 'failed'
}

export const chatRouteState = (value: unknown) => {
  const record = value && typeof value === 'object' ? (value as { intent?: unknown; postingId?: unknown }) : {}
  return {
    intent: isChatIntent(record.intent) ? record.intent : ('general' as const),
    postingId: typeof record.postingId === 'string' && record.postingId ? record.postingId : undefined,
  }
}
