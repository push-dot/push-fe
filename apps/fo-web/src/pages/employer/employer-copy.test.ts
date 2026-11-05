import { describe, expect, it } from 'vitest'
import { EMPLOYER_POSTING_NOTE } from '../posting/constants'
import { AI_POSTING, AI_REVIEW, CHAT_ASSISTANT, CHAT_TITLE, INVITE_PERKS, VERIFY_AI_POSTING, VERIFY_DONE_LEAD, VERIFY_LEAD } from './constants'

describe('employer copy', () => {
  it('employer AI words stay', () => {
    expect(EMPLOYER_POSTING_NOTE).toBe('기업 AI 채팅이 열리고 이 공고가 첨부돼요')
    expect(VERIFY_LEAD).toContain('기업 AI')
    expect(VERIFY_DONE_LEAD).toBe('이제 공고를 올리고 기업 AI를 쓸 수 있어요.')
    expect(VERIFY_AI_POSTING).toBe('기업 AI로 공고 만들기')
    expect(AI_POSTING).toBe('AI로 만들기')
    expect(AI_REVIEW).toBe('기업 AI 서류 검토하기')
    expect(CHAT_TITLE).toBe('기업 AI')
    expect(CHAT_ASSISTANT).toBe('기업 AI')
    expect(INVITE_PERKS).toContain('기업 AI 대화 (회사가 함께 봐요)')
  })
})
