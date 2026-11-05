import { describe, expect, it } from 'vitest'
import { LOADING_NAME } from './skeleton'

describe('skeleton', () => {
  it('exposes the loading name', () => {
    expect(LOADING_NAME).toBe('불러오는 중')
  })
})
