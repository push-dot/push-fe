import { describe, expect, it, vi } from 'vitest'
import type { CareerEvidence, SourceFile } from '@/features/evidence'
import { uploadPendingFiles } from './upload-pending'

const deferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

const file = (name: string) => new File(['x'], name)

const sourceOf = (f: File) => ({ id: `src-${f.name}` }) as SourceFile
const evidenceOf = (f: File, sourceId: string) =>
  ({ id: `ev-${sourceId}`, title: f.name }) as CareerEvidence

const flush = () => new Promise<void>((r) => setTimeout(r, 0))

describe('uploadPendingFiles', () => {
  it('starts every upload before the first one settles', async () => {
    const files = [file('a.txt'), file('b.txt'), file('c.txt')]
    const gates = files.map(() => deferred<SourceFile>())
    const uploadSource = vi.fn((f: File) => gates[files.indexOf(f)].promise)
    const importEvidence = vi.fn(async (f: File, sourceId: string) =>
      evidenceOf(f, sourceId),
    )

    const pending = uploadPendingFiles(files, { uploadSource, importEvidence })
    await flush()

    expect(uploadSource).toHaveBeenCalledTimes(3)

    gates.forEach((g) => g.resolve(sourceOf(files[gates.indexOf(g)])))
    const result = await pending

    expect(result.evidence.map((e) => e.title)).toEqual([
      'a.txt',
      'b.txt',
      'c.txt',
    ])
    expect(result.failed).toEqual([])
  })

  it('keeps only failed files and preserves successful evidence', async () => {
    const files = [file('a.txt'), file('b.txt'), file('c.txt')]
    const boom = new Error('upload failed')
    const uploadSource = vi.fn(async (f: File) => {
      if (f.name === 'b.txt') throw boom
      return sourceOf(f)
    })
    const importEvidence = vi.fn(async (f: File, sourceId: string) =>
      evidenceOf(f, sourceId),
    )

    const result = await uploadPendingFiles(files, {
      uploadSource,
      importEvidence,
    })

    expect(result.evidence.map((e) => e.title)).toEqual(['a.txt', 'c.txt'])
    expect(result.failed).toEqual([{ file: files[1], error: boom }])
  })

  it('captures importEvidence failures the same way', async () => {
    const files = [file('a.txt'), file('b.txt')]
    const boom = new Error('import failed')
    const uploadSource = vi.fn(async (f: File) => sourceOf(f))
    const importEvidence = vi.fn(async (f: File, sourceId: string) => {
      if (f.name === 'b.txt') throw boom
      return evidenceOf(f, sourceId)
    })

    const result = await uploadPendingFiles(files, {
      uploadSource,
      importEvidence,
    })

    expect(result.evidence.map((e) => e.title)).toEqual(['a.txt'])
    expect(result.failed).toEqual([{ file: files[1], error: boom }])
  })
})
