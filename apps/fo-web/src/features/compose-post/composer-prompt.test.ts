import { describe, expect, it } from 'vitest'
import { composerPrompt } from './composer-prompt'

describe('composerPrompt', () => {
  it('speaks as the company for an employer and keeps the personal prompt', () => {
    expect(composerPrompt(true, '모아페이')).toBe('모아페이 이름으로 글을 써요')
    expect(composerPrompt(false, '김서준')).toBe('어떤 이야기를 나눌까요?')
    expect(composerPrompt(true, '')).toBe('어떤 이야기를 나눌까요?')
  })
})
