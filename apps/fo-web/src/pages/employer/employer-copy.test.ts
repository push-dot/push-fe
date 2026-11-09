import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { EMPLOYER_POSTING_NOTE } from '../posting/constants'
import { applicantChipTitle, applicantKicker, lockAdminNote } from './chat-copy'
import { PAYMENTS_CLOSED, PLAN_ACTION_FAILED, planActionError, AI_POSTING, AI_REVIEW, CHAT_ASSISTANT, CHAT_TITLE, INVITE_PERKS, VERIFY_AI_POSTING, VERIFY_DONE_LEAD, VERIFY_LEAD } from './constants'

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

describe('planActionError', () => {
  it('says payments are not open yet for 503 PAYMENTS_DISABLED', () => {
    expect(planActionError(new ApiError('closed', 'PAYMENTS_DISABLED', 503))).toBe(PAYMENTS_CLOSED)
    expect(PAYMENTS_CLOSED).toBe('결제는 아직 준비 중이에요')
  })

  it('keeps the generic copy for every other failure', () => {
    expect(planActionError(new ApiError('boom', 'INTERNAL', 500))).toBe(PLAN_ACTION_FAILED)
    expect(planActionError(new Error('offline'))).toBe(PLAN_ACTION_FAILED)
  })
})

describe('chat chips and lock note', () => {
  it('names the applicant chip like the board', () => {
    expect(applicantChipTitle('김태윤')).toBe('김태윤 · 이력서 · 포트폴리오')
    expect(applicantChipTitle('김태윤', '김태윤')).toBe('김태윤 · 이력서 · 포트폴리오')
    expect(applicantChipTitle('김태윤', '김태윤 · 이력서')).toBe('김태윤 · 이력서')
  })

  it('drops the stack suffix from the posting in the label', () => {
    expect(applicantKicker('결제 승인 백엔드 엔지니어 (Kotlin)')).toBe('지원자 · 결제 승인 백엔드 엔지니어')
    expect(applicantKicker('')).toBe('지원자')
  })

  it('tells only a member, and only while payments are open, that the admin changes the plan', () => {
    expect(lockAdminNote(false, true)).toBe('요금제는 관리자만 바꿀 수 있어요')
    expect(lockAdminNote(true, true)).toBeNull()
    expect(lockAdminNote(false, false)).toBeNull()
  })
})
