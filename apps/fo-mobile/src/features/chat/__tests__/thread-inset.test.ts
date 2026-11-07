import { describe, expect, it } from 'vitest'
import { threadInset } from '../utils/thread-inset'

describe('threadInset', () => {
  it('keeps the thread above the composer and the keyboard', () => {
    expect(threadInset(160, 0, false)).toBe(176)
    expect(threadInset(160, 336, false)).toBe(512)
  })

  it('leaves the design gap above an approval sheet', () => {
    expect(threadInset(260, 0, true)).toBe(310)
  })
})
