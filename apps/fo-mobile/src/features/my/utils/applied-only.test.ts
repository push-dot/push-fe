import type { Application } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { appliedOnly } from './applied-only'

const app = (id: string, appliedAt: string | null) => ({ id, appliedAt }) as Application

describe('appliedOnly', () => {
  it('drops applications push-be lists before they are sent', () => {
    const list = [app('a1', '2026-10-14T00:00:00Z'), app('a2', null), app('a3', '2026-10-10T00:00:00Z')]
    expect(appliedOnly(list).map((a) => a.id)).toEqual(['a1', 'a3'])
  })
})
