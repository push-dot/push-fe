import { ApiError, QueueBusyError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { CHAT_CREDITS, CHAT_CREDITS_CLOSED, CHAT_FAILED, PLAN_REQUIRED_CLOSED, streamErrorText } from './constants'

describe('streamErrorText', () => {
  it('maps NOT_CONFIGURED', () => {
    expect(streamErrorText(new ApiError('missing', 'NOT_CONFIGURED', 0))).toBe('지금은 에이전트를 쓸 수 없어요. 잠시 뒤에 다시 해 주세요.')
  })

  it('maps QUEUE_BUSY, including the retry delay', () => {
    expect(streamErrorText(new ApiError('busy', 'QUEUE_BUSY', 0))).toBe('지금 요청이 많아요. 잠시 뒤에 다시 보내 주세요.')
    expect(streamErrorText(new ApiError('busy', 'QUEUE_BUSY', 0, { retryAfterSec: 12 }))).toBe('지금 요청이 많아요. 12초 뒤에 다시 보내 주세요.')
    expect(streamErrorText(new QueueBusyError('busy', 12))).toBe('지금 요청이 많아요. 12초 뒤에 다시 보내 주세요.')
  })

  it('says billing is busy for QUEUE_BUSY with reason BILLING_LOCKED', () => {
    expect(streamErrorText(new QueueBusyError('billing is busy', 5, { retryAfterSec: 5, ahead: 0, reason: 'BILLING_LOCKED' }))).toBe(
      '결제 정보를 정리하고 있어요. 5초 뒤에 다시 보내 주세요.',
    )
  })

  it('maps PLAN_REQUIRED', () => {
    expect(streamErrorText(new ApiError('plan', 'PLAN_REQUIRED', 403))).toBe('요금제를 올리면 쓸 수 있어요.')
  })

  it('maps FEATURE_DISABLED to the credit top-up line', () => {
    expect(streamErrorText(new ApiError('off', 'FEATURE_DISABLED', 403))).toBe(CHAT_CREDITS)
  })

  it('maps INSUFFICIENT_CREDITS to the credit top-up line', () => {
    expect(streamErrorText(new ApiError('empty', 'INSUFFICIENT_CREDITS', 402))).toBe(CHAT_CREDITS)
  })

  it('states the fact instead of asking for payment while payments are closed', () => {
    expect(streamErrorText(new ApiError('empty', 'INSUFFICIENT_CREDITS', 402), false)).toBe(CHAT_CREDITS_CLOSED)
    expect(streamErrorText(new ApiError('off', 'FEATURE_DISABLED', 403), false)).toBe(CHAT_CREDITS_CLOSED)
    expect(streamErrorText(new ApiError('plan', 'PLAN_REQUIRED', 403), false)).toBe(PLAN_REQUIRED_CLOSED)
    expect(streamErrorText(new ApiError('nope', 'HTTP_ERROR', 500), false)).toBe('작업을 이어가지 못했어요. 다시 보내 주세요.')
  })

  it('uses the resend fallback for an unknown run error', () => {
    expect(streamErrorText(new ApiError('nope', 'HTTP_ERROR', 500))).toBe('작업을 이어가지 못했어요. 다시 보내 주세요.')
    expect(streamErrorText(new Error('offline'))).toBe('작업을 이어가지 못했어요. 다시 보내 주세요.')
    expect(streamErrorText(new ApiError('missing', 'NOT_CONFIGURED', 0))).not.toBe(CHAT_FAILED)
  })
})
