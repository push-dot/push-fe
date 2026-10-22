import { describe, expect, it } from 'vitest'
import { employerStageLabel } from './stage-label'

describe('employerStageLabel', () => {
  it('uses the employer stage names', () => {
    expect(employerStageLabel('APPLIED')).toBe('지원함')
    expect(employerStageLabel('SCREENING')).toBe('서류 통과')
    expect(employerStageLabel('INTERVIEW')).toBe('면접')
    expect(employerStageLabel('OFFER')).toBe('합격')
    expect(employerStageLabel('ACCEPTED')).toBe('합격')
    expect(employerStageLabel('REJECTED')).toBe('불합격')
    expect(employerStageLabel('WITHDRAWN')).toBe('불합격')
  })
})
