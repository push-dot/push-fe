import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { editorFailure } from './editor-failure'

describe('editorFailure', () => {
  it('surfaces the 409 conflict copy and a generic save failure otherwise', () => {
    expect(editorFailure(new ApiError('공고가 이미 바뀌었어요', 'REVISION_CONFLICT', 409))).toBe('공고가 이미 바뀌었어요')
    expect(editorFailure(new ApiError('공고가 이미 바뀌었어요', 'HTTP_ERROR', 409))).toBe('공고가 이미 바뀌었어요')
    expect(editorFailure(new ApiError('nope', 'HTTP_ERROR', 500))).toBe('공고를 저장하지 못했어요')
    expect(editorFailure(new Error('offline'))).toBe('공고를 저장하지 못했어요')
  })
})
