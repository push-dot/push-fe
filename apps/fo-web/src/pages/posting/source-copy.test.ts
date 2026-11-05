import { describe, expect, it } from 'vitest'
import { CONSENT_COPY } from '../settings/constants'
import { SOURCE_AI } from './constants'

describe('tailored doc label', () => {
  it('tailored doc label', () => {
    expect(SOURCE_AI).toBe('에이전트로 맞춘 서류')
    expect(CONSENT_COPY).toContain('기업의 AI')
  })
})
