import { describe, expect, it } from 'vitest'
import { DOCUMENT_AI_LABEL } from './constants'

describe('document label', () => {
  it('says AI drafts are made in the app', () => {
    expect(DOCUMENT_AI_LABEL).toBe('앱의 AI 채팅에서 만듦')
  })
})
