import type { CompanyPosting } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { agoLabel, deadlineLabel, filterRows, statusOf, subLine } from './posting-view'

const posting = (patch: Partial<CompanyPosting>): CompanyPosting => ({
  id: 'p',
  company: '모아페이',
  title: '결제 승인 백엔드 엔지니어',
  jobCategory: 'dev',
  imageUrl: null,
  skills: [],
  careerMin: 4,
  careerMax: 6,
  location: '서울',
  employmentType: 'full_time',
  deadline: null,
  bookmarked: false,
  applied: false,
  sourceUrl: null,
  createdAt: '2026-10-20T00:00:00.000Z',
  ...patch,
})

const NOW = Date.parse('2026-10-21T01:00:00.000Z')

describe('posting row view', () => {
  it('reads closedAt when an older server sends no status', () => {
    expect(statusOf(posting({}))).toBe('OPEN')
    expect(statusOf(posting({ closedAt: '2026-09-30T00:00:00.000Z' }))).toBe('CLOSED')
    expect(statusOf(posting({ status: 'DRAFT' }))).toBe('DRAFT')
  })

  it('names the author on open rows and the agent on drafts', () => {
    expect(subLine(posting({ createdBy: { displayName: '이민아' } }), NOW)).toBe('경력 4–6년 · 정규직 · 이민아가 올림')
    expect(subLine(posting({ createdBy: null }), NOW)).toBe('경력 4–6년 · 정규직')
    expect(subLine(posting({ status: 'DRAFT', draftSource: 'AGENT' }), NOW)).toBe('에이전트가 쓴 초안 · 어제')
    expect(subLine(posting({ status: 'DRAFT', draftSource: 'MANUAL', createdBy: { displayName: '김솔' } }), NOW)).toBe('김솔이 쓴 초안 · 어제')
  })

  it('shows 상시 only for open postings without a deadline', () => {
    expect(deadlineLabel(posting({}))).toBe('상시')
    expect(deadlineLabel(posting({ status: 'DRAFT' }))).toBe('–')
    expect(deadlineLabel(posting({ status: 'CLOSED', deadline: '2026-09-30' }))).toBe('9월 30일')
  })

  it('counts days by calendar day', () => {
    expect(agoLabel('2026-10-21T00:30:00.000Z', NOW)).toBe('오늘')
    expect(agoLabel('2026-10-18T00:00:00.000Z', NOW)).toBe('3일 전')
  })

  it('filters by status', () => {
    const rows = [posting({ id: 'a' }), posting({ id: 'b', status: 'DRAFT' }), posting({ id: 'c', closedAt: '2026-09-30T00:00:00.000Z' })]
    expect(filterRows(rows, 'draft').map((row) => row.id)).toEqual(['b'])
    expect(filterRows(rows, 'all')).toHaveLength(3)
  })
})
