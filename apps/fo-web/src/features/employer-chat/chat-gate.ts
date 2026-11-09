import { ApiError } from '@push/api-client'
import type { ChatIntent } from '../../shared/model/employer-chat'
import { HTTP_TOO_MANY_REQUESTS } from './constants'

export type ChatBlock = 'interview' | 'pdf' | 'verify' | 'credits' | 'busy' | 'failed'

export const isChatIntent = (value: unknown): value is ChatIntent =>
  value === 'posting' || value === 'review' || value === 'interview' || value === 'general'

export const chatGateFrom = (error: unknown): ChatBlock => {
  if (error instanceof ApiError && error.code === 'BUSINESS_NOT_VERIFIED') return 'verify'
  // Employer chat answers 403 FEATURE_DISABLED when the month's credit is used up: the same limit as 402.
  if (error instanceof ApiError && (error.code === 'INSUFFICIENT_CREDITS' || error.code === 'FEATURE_DISABLED')) return 'credits'
  if (error instanceof ApiError && error.status === HTTP_TOO_MANY_REQUESTS) return 'busy'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'ULTRA') return 'pdf'
  if (error instanceof ApiError && error.code === 'PLAN_REQUIRED' && error.details?.requiredPlan === 'PRO') return 'interview'
  return 'failed'
}

// push-be removes the question only when a DomainError rejects the job (_drop_enqueued_user_message).
const KEPT_CODES = ['INTERNAL', 'NOT_CONFIGURED']

/**
 * A failure after the job was accepted: `dropped` is the connection (the job keeps running and is followed again),
 * `kept` a job that failed with the question stored, null a rejection that removed the question.
 */
export const acceptedFailure = (error: unknown): 'dropped' | 'kept' | null => {
  if (!(error instanceof ApiError) || error.code === 'NETWORK_ERROR' || error.code === 'STREAM_PARSE') return 'dropped'
  return error.status === 0 && KEPT_CODES.includes(error.code) ? 'kept' : null
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
