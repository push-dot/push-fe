import { ApiError } from '@push/api-client'
import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

import {
  VERIFY_RESEND_COOLDOWN_MS,
  VERIFY_RESEND_FAILED,
  VERIFY_RESEND_LATER,
  VERIFY_RESEND_SENT,
} from './constants'
import { requestVerifyResend, resendCooling } from './verify-resend'

describe('requestVerifyResend', () => {
  it('asks resendVerify for a new mail and toasts that it went out', async () => {
    const send = vi.fn(async () => undefined)
    await expect(requestVerifyResend('a@push.app', send)).resolves.toEqual({
      toast: VERIFY_RESEND_SENT,
      error: null,
      cooldownMs: VERIFY_RESEND_COOLDOWN_MS,
    })
    expect(send).toHaveBeenCalledWith('a@push.app')
    expect(VERIFY_RESEND_SENT).toBe('인증 메일을 다시 보냈어요')
    expect(VERIFY_RESEND_COOLDOWN_MS).toBe(60_000)
  })

  it('keeps the button quiet for a minute when the mail bucket answers 429', async () => {
    const send = async () => {
      throw new ApiError('slow down', 'RATE_LIMITED', 429, { retryAfterSec: 60 })
    }
    await expect(requestVerifyResend('a@push.app', send)).resolves.toEqual({
      toast: null,
      error: VERIFY_RESEND_LATER,
      cooldownMs: VERIFY_RESEND_COOLDOWN_MS,
    })
    expect(VERIFY_RESEND_LATER).toBe('잠시 뒤에 다시 보내 주세요')
  })

  it('does not start the cooldown when the send itself failed', async () => {
    const send = async () => {
      throw new ApiError('mail failed', 'INTERNAL', 500)
    }
    await expect(requestVerifyResend('a@push.app', send)).resolves.toEqual({
      toast: null,
      error: VERIFY_RESEND_FAILED,
      cooldownMs: 0,
    })
  })
})

describe('resendCooling', () => {
  it('stays disabled until the 60s mark', () => {
    expect(resendCooling(1_000, 61_000)).toBe(true)
    expect(resendCooling(61_000, 61_000)).toBe(false)
  })
})

describe('verify resend wiring', () => {
  it('sends the expired screen and the sent screen through resendVerify, not another sign-up', () => {
    const expired = readFileSync(new URL('./verify-page.tsx', import.meta.url), 'utf8')
    const signup = readFileSync(new URL('./signup-page.tsx', import.meta.url), 'utf8')
    const resend = readFileSync(new URL('./verify-resend.ts', import.meta.url), 'utf8')
    expect(expired).toContain('useVerifyResend')
    expect(expired).not.toContain('authEmailSignup')
    expect(signup).toContain('useVerifyResend')
    expect(signup).not.toContain('onResend={() => void send()}')
    expect(resend).toContain('authEmailResendVerify')
  })
})
