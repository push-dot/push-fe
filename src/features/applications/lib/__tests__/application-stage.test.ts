import { describe, expect, it } from 'vitest'
import { isTerminalStage, nextStage } from '../application-stage'

describe('application stage machine', () => {
  it('moves forward one stage at a time', () => {
    expect(nextStage('DISCOVERED')).toBe('PREPARING')
    expect(nextStage('READY')).toBe('APPLIED')
    expect(nextStage('OFFER')).toBe('ACCEPTED')
  })

  it('returns null at the end of the pipeline and for exit stages', () => {
    expect(nextStage('ACCEPTED')).toBeNull()
    expect(nextStage('REJECTED')).toBeNull()
  })

  it('locks terminal stages', () => {
    expect(isTerminalStage('ACCEPTED')).toBe(true)
    expect(isTerminalStage('REJECTED')).toBe(true)
    expect(isTerminalStage('WITHDRAWN')).toBe(true)
    expect(isTerminalStage('DISCOVERED')).toBe(false)
  })
})
