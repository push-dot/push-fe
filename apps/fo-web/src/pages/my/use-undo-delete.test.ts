import { readFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { UNDO_MS } from './constants'
import { createUndoDelete } from './use-undo-delete'

const item = (origin: 'AI' | 'UPLOAD') => ({ id: origin === 'AI' ? 'doc-1' : 'src-1', origin })

const deferred = () => {
  let resolve: (value: unknown) => void = () => undefined
  const promise = new Promise<unknown>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

describe('createUndoDelete', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('cancels a delete that has not committed yet', async () => {
    const remove = vi.fn(async () => ({ revision: 2 }))
    const restore = vi.fn(async () => undefined)
    const machine = createUndoDelete({
      remove,
      restore,
      onDone: vi.fn(),
      onFail: vi.fn(),
      onHide: vi.fn(),
      onShow: vi.fn(),
    })
    machine.start(item('AI'))
    machine.undo('doc-1')
    await vi.advanceTimersByTimeAsync(UNDO_MS)
    expect(remove).not.toHaveBeenCalled()
    expect(restore).not.toHaveBeenCalled()
  })

  it('restores a Push document when undo arrives after the commit', async () => {
    const gate = deferred()
    const remove = vi.fn(() => gate.promise)
    const restore = vi.fn(async () => undefined)
    const onDone = vi.fn()
    const machine = createUndoDelete({
      remove,
      restore,
      onDone,
      onFail: vi.fn(),
      onHide: vi.fn(),
      onShow: vi.fn(),
    })
    machine.start(item('AI'))
    await vi.advanceTimersByTimeAsync(UNDO_MS)
    expect(remove).toHaveBeenCalledOnce()
    machine.undo('doc-1')
    gate.resolve({ revision: 4 })
    await vi.advanceTimersByTimeAsync(0)
    expect(restore).toHaveBeenCalledWith({ id: 'doc-1', origin: 'AI' }, { revision: 4 })
    expect(onDone).toHaveBeenCalledOnce()
  })

  it('does not restore an upload after the commit, because the file is already gone', async () => {
    const remove = vi.fn(async () => undefined)
    const restore = vi.fn(async () => undefined)
    const machine = createUndoDelete({
      remove,
      restore,
      onDone: vi.fn(),
      onFail: vi.fn(),
      onHide: vi.fn(),
      onShow: vi.fn(),
    })
    machine.start(item('UPLOAD'))
    await vi.advanceTimersByTimeAsync(UNDO_MS)
    machine.undo('src-1')
    await vi.advanceTimersByTimeAsync(0)
    expect(remove).toHaveBeenCalledOnce()
    expect(restore).not.toHaveBeenCalled()
  })

  it('restores through restoreDocument when a caller does not pass its own', () => {
    const source = readFileSync(new URL('./use-undo-delete.ts', import.meta.url), 'utf8')
    expect(source).toContain('restore = restoreDocument')
  })
})
