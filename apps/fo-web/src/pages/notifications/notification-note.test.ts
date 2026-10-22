import { describe, expect, it } from 'vitest'
import { NOTIFICATION_NOTE } from './constants'

describe('notification note', () => {
  it('says AI-done alerts stay in the app', () => {
    expect(NOTIFICATION_NOTE).toBe('AI 작업 완료 알림은 앱에서 받아요')
  })
})
