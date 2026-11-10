import { describe, expect, it } from 'vitest'
import { stepOption } from './chat-choice-keys'

describe('stepOption', () => {
  it('moves down and up through the options and wraps', () => {
    expect(stepOption('ArrowDown', 0, 3)).toBe(1)
    expect(stepOption('ArrowDown', 2, 3)).toBe(0)
    expect(stepOption('ArrowUp', 0, 3)).toBe(2)
    expect(stepOption('ArrowUp', 2, 3)).toBe(1)
  })

  it('ignores every other key and an empty card', () => {
    expect(stepOption('Enter', 0, 3)).toBeNull()
    expect(stepOption('ArrowDown', 0, 0)).toBeNull()
  })
})
