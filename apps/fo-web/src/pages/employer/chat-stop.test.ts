import { readFileSync } from 'node:fs'
import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { CHAT_STOP_FAILED, CHAT_STOP_FORBIDDEN, stopFailedText } from './constants'

describe('stop failure copy', () => {
  it('tells a member they cannot stop someone else’s job, and keeps the retry copy for anything else', () => {
    expect(stopFailedText(new ApiError('forbidden', 'FORBIDDEN', 403))).toBe(CHAT_STOP_FORBIDDEN)
    expect(CHAT_STOP_FORBIDDEN).toBe('다른 담당자가 시작한 작업이라 멈출 수 없어요')
    expect(stopFailedText(new ApiError('not verified', 'BUSINESS_NOT_VERIFIED', 403))).toBe(
      CHAT_STOP_FAILED,
    )
    expect(stopFailedText(new ApiError('down', 'INTERNAL', 500))).toBe(CHAT_STOP_FAILED)
    expect(stopFailedText(new Error('offline'))).toBe(CHAT_STOP_FAILED)
  })

  it('uses that copy when the room’s cancel fails', () => {
    const source = readFileSync(new URL('./chat-room.tsx', import.meta.url), 'utf8')
    const halt = source.slice(source.indexOf('const halt'), source.indexOf('const tracker'))
    expect(halt).toContain('stopFailedText(error)')
    expect(halt).not.toContain('CHAT_STOP_FAILED')
  })
})
