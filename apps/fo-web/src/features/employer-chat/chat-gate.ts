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

// These frames mean the job was accepted. A DomainError of either code still deletes the USER row;
// questionForComposer looks at the refresh before putting the question back.
const KEPT_CODES = ['INTERNAL', 'NOT_CONFIGURED']

/**
 * A failure after the job was accepted: `dropped` is the connection (the job keeps running and is followed again),
 * `kept` an INTERNAL or NOT_CONFIGURED frame (the question may have been deleted), null a rejection.
 */
export const acceptedFailure = (error: unknown): 'dropped' | 'kept' | null => {
  if (!(error instanceof ApiError) || error.code === 'NETWORK_ERROR' || error.code === 'STREAM_PARSE') return 'dropped'
  return error.status === 0 && KEPT_CODES.includes(error.code) ? 'kept' : null
}

/**
 * DomainError INTERNAL and NOT_CONFIGURED delete the question push-be already stored
 * (`_drop_enqueued_user_message`). A generic INTERNAL leaves it. After the refresh, put it back
 * in the composer only when no new saved message has it.
 */
export const questionForComposer = (
  error: unknown,
  question: string,
  messages: { id: string; role: string; text: string }[],
  known: readonly string[],
) => {
  if (acceptedFailure(error) !== 'kept') return null
  const seen = new Set(known)
  const kept = messages.some((message) => !seen.has(message.id) && message.role === 'USER' && message.text === question)
  return kept ? null : question
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
