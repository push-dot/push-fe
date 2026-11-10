import { describe, expect, it } from 'vitest'
import { anchoredTop, nearBottom, nearTop } from './chat-scroll'

describe('nearBottom', () => {
  it('follows a reader who is at the newest message', () => {
    expect(nearBottom({ scrollHeight: 2000, scrollTop: 1200, clientHeight: 800 })).toBe(true)
    expect(nearBottom({ scrollHeight: 2000, scrollTop: 1130, clientHeight: 800 })).toBe(true)
  })

  it('leaves a reader who scrolled up alone', () => {
    expect(nearBottom({ scrollHeight: 2000, scrollTop: 600, clientHeight: 800 })).toBe(false)
  })

  it('counts a thread shorter than the area as at the bottom', () => {
    expect(nearBottom({ scrollHeight: 500, scrollTop: 0, clientHeight: 800 })).toBe(true)
  })
})

describe('older pages', () => {
  it('asks for them only at the top', () => {
    expect(nearTop({ scrollTop: 40 })).toBe(true)
    expect(nearTop({ scrollTop: 400 })).toBe(false)
  })

  it('keeps the message the reader was on in place when a page goes in above it', () => {
    expect(anchoredTop({ height: 2000, top: 10 }, 3500)).toBe(1510)
  })
})
