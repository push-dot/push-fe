import { ApiError, QueueBusyError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { approvalFailureFrom, chatGateFrom, questionForComposer } from './chat-gate'

describe('chatGateFrom', () => {
  it('maps plan, verification, and unknown failures', () => {
    expect(chatGateFrom(new ApiError('locked', 'PLAN_REQUIRED', 403, { requiredPlan: 'PRO' }))).toBe('interview')
    expect(chatGateFrom(new ApiError('locked', 'PLAN_REQUIRED', 403, { requiredPlan: 'ULTRA' }))).toBe('pdf')
    expect(chatGateFrom(new ApiError('verify', 'BUSINESS_NOT_VERIFIED', 403))).toBe('verify')
    expect(chatGateFrom(new ApiError('no credits', 'INSUFFICIENT_CREDITS', 402))).toBe('credits')
    expect(chatGateFrom(new ApiError('used up', 'FEATURE_DISABLED', 403))).toBe('credits')
    expect(chatGateFrom(new QueueBusyError('queue is busy', 12))).toBe('busy')
    expect(chatGateFrom(new ApiError('slow down', 'RATE_LIMITED', 429))).toBe('busy')
    expect(chatGateFrom(new ApiError('nope', 'HTTP_ERROR', 500))).toBe('failed')
    expect(chatGateFrom(new Error('offline'))).toBe('failed')
  })

  it('puts a vanished INTERNAL or NOT_CONFIGURED question back only when the refresh did not keep it', () => {
    const known = ['m0']
    const older = [{ id: 'm0', role: 'USER', text: '정리해 줘' }]
    const kept = [...older, { id: 'm1', role: 'USER', text: '정리해 줘' }]
    expect(questionForComposer(new ApiError('x', 'INTERNAL', 0), '정리해 줘', [], known)).toBe('정리해 줘')
    expect(questionForComposer(new ApiError('x', 'NOT_CONFIGURED', 0), '정리해 줘', older, known)).toBe('정리해 줘')
    expect(questionForComposer(new ApiError('x', 'INTERNAL', 0), '정리해 줘', kept, known)).toBeNull()
    expect(questionForComposer(new ApiError('x', 'PLAN_REQUIRED', 0), '정리해 줘', [], known)).toBeNull()
    expect(questionForComposer(new ApiError('x', 'NETWORK_ERROR', 0), '정리해 줘', [], known)).toBeNull()
  })

  it('maps approval answer failures', () => {
    expect(approvalFailureFrom(new ApiError('dup', 'APPROVAL_ALREADY_RESOLVED', 409))).toBe('resolved')
    expect(approvalFailureFrom(new ApiError('old', 'APPROVAL_EXPIRED', 410))).toBe('expired')
    expect(approvalFailureFrom(new Error('offline'))).toBe('failed')
  })
})
