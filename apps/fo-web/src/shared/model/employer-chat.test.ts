import { describe, expect, it } from 'vitest'
import { canUseEmployerAi } from './employer-plan'
import { POSTING_DRAFT_REPLY, REVIEW_REPLY, intentLocked, parsePostingDraft, pdfLocked } from './employer-chat'

const postingDraft = {
  title: '백엔드 엔지니어',
  description: '결제 승인 API를 설계하고 운영해요',
  requirements: ['서버 개발 경력'],
  preferred: ['금융 도메인 경험'],
  workConditions: { 근무: '주 5일' },
}

describe('intentLocked', () => {
  it('locks interview on Basic and on no plan, and leaves Pro and Ultra open', () => {
    expect(intentLocked('interview', 'BASIC')).toBe('PRO')
    expect(intentLocked('interview', null)).toBe('PRO')
    expect(intentLocked('interview', 'PRO')).toBeNull()
    expect(intentLocked('interview', 'ULTRA')).toBeNull()
  })

  it('leaves posting and review open on Basic', () => {
    expect(intentLocked('posting', 'BASIC')).toBeNull()
    expect(intentLocked('review', 'BASIC')).toBeNull()
    expect(intentLocked('general', 'BASIC')).toBeNull()
  })
})

describe('pdfLocked', () => {
  it('locks external PDF until Ultra', () => {
    expect(pdfLocked('BASIC')).toBe(true)
    expect(pdfLocked('PRO')).toBe(true)
    expect(pdfLocked(null)).toBe(true)
    expect(pdfLocked('ULTRA')).toBe(false)
  })
})

describe('canUseEmployerAi', () => {
  it('stays closed until the company is verified', () => {
    expect(canUseEmployerAi(false)).toBe(false)
  })
})

describe('employer chat copy', () => {
  it('keeps the review reply free of pass or fail verdicts', () => {
    expect(REVIEW_REPLY).toBe('5년 차라고 적었지만 같은 연차 80점대 서류보다 기술 설명이 얕아요')
    expect(REVIEW_REPLY.includes('합격')).toBe(false)
    expect(REVIEW_REPLY.includes('불합격')).toBe(false)
  })

  it('reads a posting-draft fence and ignores a missing or broken fence', () => {
    expect(parsePostingDraft(POSTING_DRAFT_REPLY)).toEqual(postingDraft)
    expect(parsePostingDraft('공고 초안을 적어 주세요')).toBeNull()
    expect(parsePostingDraft('```posting-draft\n{bad}\n```')).toBeNull()
  })
})
