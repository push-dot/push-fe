import { beforeEach, describe, expect, it, vi } from 'vitest'

const ops = vi.hoisted(() => ({
  applicationsList: vi.fn(),
  documentsArchive: vi.fn(async () => ({})),
  documentsExportFile: vi.fn(),
  documentsGet: vi.fn(),
  documentsRename: vi.fn(),
  sourcesContent: vi.fn(),
  sourcesRemove: vi.fn(async () => undefined),
}))
vi.mock('../../shared/api/operations', () => ops)

const { removeDocument } = await import('./manage-documents')

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
