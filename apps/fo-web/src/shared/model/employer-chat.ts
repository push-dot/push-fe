import { canInterviewPrep, canUploadExternalPdf, type EmployerPlanId } from './employer-plan'

export type ChatIntent = 'posting' | 'review' | 'interview' | 'general'

export type PostingDraft = {
  title: string
  description: string
  requirements: string[]
  preferred: string[]
  workConditions: Record<string, unknown>
}

export const REVIEW_REPLY = '5년 차라고 적었지만 같은 연차 80점대 서류보다 기술 설명이 얕아요'

export const GENERAL_REPLY = '어떤 공고를 만들까요?'

const POSTING_DRAFT = {
  title: '백엔드 엔지니어',
  description: '결제 승인 API를 설계하고 운영해요',
  requirements: ['서버 개발 경력'],
  preferred: ['금융 도메인 경험'],
  workConditions: { 근무: '주 5일' },
}

export const POSTING_DRAFT_REPLY = ['이 내용으로 공고를 적어 봤어요.', '```posting-draft', JSON.stringify(POSTING_DRAFT, null, 2), '```'].join('\n')

export const intentLocked = (intent: ChatIntent, plan: EmployerPlanId): 'PRO' | 'ULTRA' | null =>
  intent === 'interview' && !canInterviewPrep(plan) ? 'PRO' : null

export const pdfLocked = (plan: EmployerPlanId): boolean => !canUploadExternalPdf(plan)

const FENCE = /```posting-draft[ \t]*\r?\n([\s\S]*?)```/

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

export const parsePostingDraft = (text: string): PostingDraft | null => {
  const body = text.match(FENCE)?.[1]
  if (!body) return null
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed)) return null
    if (typeof parsed.title !== 'string' || typeof parsed.description !== 'string') return null
    if (!isStringArray(parsed.requirements) || !isStringArray(parsed.preferred)) return null
    if (!isRecord(parsed.workConditions)) return null
    return {
      title: parsed.title,
      description: parsed.description,
      requirements: parsed.requirements,
      preferred: parsed.preferred,
      workConditions: parsed.workConditions,
    }
  } catch {
    return null
  }
}

export const assistantReply = (intent: ChatIntent | undefined, text: string) => {
  if (intent === 'review' || text.includes('서류')) return REVIEW_REPLY
  if (intent === 'posting' || text.includes('공고')) return POSTING_DRAFT_REPLY
  return GENERAL_REPLY
}
