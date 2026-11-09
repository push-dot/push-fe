import { ApiError } from '@push/api-client'

export type OfferFailure = { blocked: true } | { blocked: false; message: string }

export const offerFailure = (reason: unknown): OfferFailure => {
  if (reason instanceof ApiError && reason.code === 'BLOCKED') return { blocked: true }
  const message = reason instanceof ApiError && reason.code === 'CONFLICT' ? '이미 제안을 보냈어요.' : '제안을 보내지 못했어요. 잠시 후 다시 시도해 주세요.'
  return { blocked: false, message }
}
