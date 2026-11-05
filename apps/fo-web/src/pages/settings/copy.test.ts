import { describe, expect, it } from 'vitest'
import { CONSENT_COPY, LOCALE_NOTE, NOTIFY_ROWS } from './constants'

describe('settings copy', () => {
  it('agent locale note', () => {
    expect(LOCALE_NOTE).toBe('앱 화면과 에이전트 답변 언어가 함께 바뀌어요.')
  })

  it('agent done label', () => {
    expect(NOTIFY_ROWS.find((row) => row.key === 'notifyAiDone')?.label).toBe('에이전트 작업 완료')
    expect(CONSENT_COPY).toContain('기업의 AI')
  })
})
