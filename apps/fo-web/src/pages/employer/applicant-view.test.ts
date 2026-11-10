import { describe, expect, it } from 'vitest'

import { applicantProfileLine, applicantSub, careerRows, docChips, stageTabs } from './applicant-view'

describe('applicant view', () => {
  it('joins category, tenure and headline', () => {
    expect(applicantSub({ displayName: '김태윤', headline: '모아페이와 같은 결제 도메인', jobCategory: 'dev', tenureYears: 5 })).toBe('개발 · 5년 · 모아페이와 같은 결제 도메인')
    expect(applicantSub({ displayName: '정민재', headline: null })).toBe('')
  })

  it('says the detail is the live profile only when there is no snapshot', () => {
    expect(applicantProfileLine('CURRENT', '10월 20일')).toBe('지금 프로필 기준')
    expect(applicantProfileLine('SUBMITTED', '10월 20일')).toBe('10월 20일 제출한 그대로예요')
    expect(applicantProfileLine(undefined, '10월 20일')).toBe('10월 20일 제출한 그대로예요')
  })

  it('puts the counts on the tabs in stage order and leaves them off without counts', () => {
    const tabs = stageTabs({ total: 38, applied: 24, screening: 8, interview: 4, offer: 1, rejected: 1 })
    expect(tabs.map((tab) => `${tab.label} ${tab.count}`)).toEqual(['전체 38', '지원함 24', '서류 통과 8', '면접 4', '합격 1', '불합격 1'])
    expect(stageTabs().every((tab) => tab.count === undefined)).toBe(true)
  })

  it('shows career periods with the span, open ended until now', () => {
    const now = Date.parse('2026-10-21T01:00:00.000Z')
    const rows = careerRows(
      [
        { company: '모아페이', role: '백엔드 엔지니어', startedOn: '2022-03-01', endedOn: null, description: '결제 승인 API 개선' },
        { company: '누리클라우드', role: '서버 개발자', startedOn: '2021-01-01', endedOn: '2022-02-28', description: '' },
      ],
      now,
    )
    expect(rows[0]?.period).toBe('2022.03 – 지금 · 4년 8개월')
    expect(rows[1]?.period).toBe('2021.01 – 2022.02 · 1년 2개월')
    expect(rows[1]?.title).toBe('누리클라우드 · 서버 개발자')
  })

  it('lists the profile first, then attached files with their pages', () => {
    const chips = docChips({
      documents: [{ id: 'd1', title: '이력서', content: '소개' }],
      files: [{ id: 'f1', fileName: '포트폴리오.pdf', mimeType: 'application/pdf', size: 1, pageCount: 14 }],
    })
    expect(chips.map((chip) => `${chip.label}/${chip.badge.label}`)).toEqual(['이력서/프로필', '포트폴리오.pdf · 14쪽/PDF'])
  })
})
