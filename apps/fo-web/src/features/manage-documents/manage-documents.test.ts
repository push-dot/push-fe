import { beforeEach, describe, expect, it, vi } from 'vitest'

const ops = vi.hoisted(() => ({
  applicationsList: vi.fn(),
  documentsArchive: vi.fn(async () => ({})),
  documentsExportFile: vi.fn(),
  documentsGet: vi.fn(),
  documentsRename: vi.fn(),
  documentsRestore: vi.fn(async () => ({})),
  sourcesContent: vi.fn(),
  sourcesRemove: vi.fn(async () => undefined),
}))
vi.mock('../../shared/api/operations', () => ops)

const { removeDocument, restoreDocument } = await import('./manage-documents')

beforeEach(() => vi.clearAllMocks())

describe('removeDocument', () => {
  it('archives a Push document, since push-be answers 404 to DELETE sources/:id for it', async () => {
    await removeDocument({ id: 'doc-1', origin: 'AI' })
    expect(ops.documentsArchive).toHaveBeenCalledWith('doc-1')
    expect(ops.sourcesRemove).not.toHaveBeenCalled()
  })

  it('deletes an uploaded file through DELETE sources/:id', async () => {
    await removeDocument({ id: 'src-1', origin: 'UPLOAD' })
    expect(ops.sourcesRemove).toHaveBeenCalledWith('src-1')
    expect(ops.documentsArchive).not.toHaveBeenCalled()
  })
})

describe('restoreDocument', () => {
  it('restores a Push document at the revision archive returned', async () => {
    await restoreDocument({ id: 'doc-1', origin: 'AI' }, { revision: 4 })
    expect(ops.documentsRestore).toHaveBeenCalledWith('doc-1', 4)
  })

  it('does not restore an upload, which push-be hard-deletes', async () => {
    await restoreDocument({ id: 'src-1', origin: 'UPLOAD' }, undefined)
    expect(ops.documentsRestore).not.toHaveBeenCalled()
  })
})
