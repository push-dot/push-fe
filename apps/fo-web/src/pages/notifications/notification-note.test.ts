import { describe, expect, it } from 'vitest'
import { NOTIFICATION_EMPTY, NOTIFICATION_NOTE } from './constants'

describe('notification note', () => {
  it('says AI-done alerts stay in the app', () => {
    expect(NOTIFICATION_NOTE).toBe('에이전트 작업 완료 알림은 앱에서 받아요')
    expect(NOTIFICATION_EMPTY).toBe('아직 받은 알림이 없어요.')
  })
})
