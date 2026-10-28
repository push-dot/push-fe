import { describe, expect, it } from 'vitest'
import { applySourceIds } from './apply-to-posting'

const source = (id: string, origin: string) => ({ id, origin })

describe('applySourceIds', () => {
  it('sends AI rows as documents and uploads as sources', () => {
    const sources = [source('doc', 'AI'), source('file', 'UPLOAD'), source('skip', 'UPLOAD')]
    expect(applySourceIds(sources, ['doc', 'file'])).toEqual({ documentIds: ['doc'], sourceIds: ['file'] })
  })
})
