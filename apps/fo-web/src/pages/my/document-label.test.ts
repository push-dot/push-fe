import { describe, expect, it } from 'vitest'
import { DOCUMENT_AI_LABEL } from './constants'

describe('document label', () => {
  it('says AI drafts are made by the agent in the app', () => {
    expect(DOCUMENT_AI_LABEL).toBe('앱의 에이전트에서 만듦')
  })
})
