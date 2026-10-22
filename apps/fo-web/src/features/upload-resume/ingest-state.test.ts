import type { QueueJob } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { ingestState } from './ingest-state'

const job = (status: QueueJob['status']): QueueJob => ({
  id: 'j1', type: 'ingest', status, progress: null, result: null, error: null, createdAt: '', updatedAt: '',
})

describe('ingestState', () => {
  it('reads until the ingest job settles and flags a failed read', () => {
    expect(ingestState(undefined, undefined)).toBeNull()
    expect(ingestState('j1', undefined)).toBe('reading')
    expect(ingestState('j1', job('QUEUED'))).toBe('reading')
    expect(ingestState('j1', job('RETRY'))).toBe('reading')
    expect(ingestState('j1', job('DONE'))).toBeNull()
    expect(ingestState('j1', job('FAILED'))).toBe('failed')
    expect(ingestState('j1', job('DEAD'))).toBe('failed')
  })
})
