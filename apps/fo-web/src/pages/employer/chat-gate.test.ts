import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { chatGateFrom } from './chat-gate'

describe('chatGateFrom', () => {
  it('maps plan, verification, and unknown failures', () => {
    expect(chatGateFrom(new ApiError('locked', 'PLAN_REQUIRED', 403, { requiredPlan: 'PRO' }))).toBe('interview')
    expect(chatGateFrom(new ApiError('locked', 'PLAN_REQUIRED', 403, { requiredPlan: 'ULTRA' }))).toBe('pdf')
    expect(chatGateFrom(new ApiError('verify', 'BUSINESS_NOT_VERIFIED', 403))).toBe('verify')
    expect(chatGateFrom(new ApiError('nope', 'HTTP_ERROR', 500))).toBe('failed')
    expect(chatGateFrom(new Error('offline'))).toBe('failed')
  })
})
