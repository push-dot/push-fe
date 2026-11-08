import { describe, expect, it } from 'vitest'
import { EMPLOYER_POSTING_NOTE } from '../posting/constants'
import { AI_POSTING, AI_REVIEW, CHAT_ASSISTANT, CHAT_TITLE, INVITE_PERKS, VERIFY_AI_POSTING, VERIFY_DONE_LEAD, VERIFY_LEAD } from './constants'

describe('employer copy', () => {
  it('employer agent words', () => {
    expect(EMPLOYER_POSTING_NOTE).toBe('에이전트 채팅이 열리고 이 공고가 첨부돼요')
    expect(VERIFY_LEAD).toContain('에이전트')
    expect(VERIFY_DONE_LEAD).toBe('이제 공고를 올리고 에이전트를 쓸 수 있어요.')
    expect(VERIFY_AI_POSTING).toBe('에이전트로 공고 만들기')
    expect(AI_POSTING).toBe('AI로 만들기')
    expect(AI_REVIEW).toBe('서류 검토하기')
    expect(CHAT_TITLE).toBe('에이전트')
    expect(CHAT_ASSISTANT).toBe('에이전트')
    expect(INVITE_PERKS).toContain('에이전트 대화 (회사가 함께 봐요)')
  })
})
