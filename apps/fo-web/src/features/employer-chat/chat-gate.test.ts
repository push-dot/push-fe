import { readFileSync } from 'node:fs'
import { ApiError, QueueBusyError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { approvalFailureFrom, chatGateFrom, composerAfterVanish, questionForComposer } from './chat-gate'

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

  it('puts the vanished question back only when the composer is still empty', () => {
    expect(composerAfterVanish('', '정리해 줘')).toBe('정리해 줘')
    expect(composerAfterVanish('이어서 쓸 말', '정리해 줘')).toBe('이어서 쓸 말')
    expect(composerAfterVanish('', null)).toBe('')
  })

  it('keeps text typed while a file upload is stopped, and restores the question only into an empty composer', () => {
    expect(composerAfterVanish('그 사이 적은 말', '첨부해서 정리해 줘')).toBe('그 사이 적은 말')
    expect(composerAfterVanish('', '첨부해서 정리해 줘')).toBe('첨부해서 정리해 줘')
    const room = readFileSync(new URL('../../pages/employer/chat-room.tsx', import.meta.url), 'utf8')
    const stopped = room.slice(room.indexOf('if (current.stopped)'), room.indexOf('const body'))
    expect(stopped).toContain('composerAfterVanish(typed, out.text)')
    expect(stopped).not.toContain('setText(out.text)')
  })

  it('maps approval answer failures', () => {
    expect(approvalFailureFrom(new ApiError('dup', 'APPROVAL_ALREADY_RESOLVED', 409))).toBe('resolved')
    expect(approvalFailureFrom(new ApiError('old', 'APPROVAL_EXPIRED', 410))).toBe('expired')
    expect(approvalFailureFrom(new Error('offline'))).toBe('failed')
  })
})
