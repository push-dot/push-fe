import { useEffect, useRef, useState } from 'react'

import { isPushDocument, restoreDocument } from '../../features/manage-documents'
import { UNDO_MS } from './constants'

type UndoItem = { id: string; origin: string }

type UndoDelete<T extends UndoItem> = {
  remove: (item: T) => Promise<unknown>
  onDone: () => Promise<unknown> | void
  onFail: (retry: () => void, error: unknown) => void
}

type Commit<T extends UndoItem> = {
  item: T
  removed: Promise<unknown>
  undoing: boolean
}

type UndoMachine<T extends UndoItem> = {
  remove: (item: T) => Promise<unknown>
  restore?: (item: T, removed: unknown) => Promise<unknown>
  onDone: () => void
  onFail: (retry: () => void, error: unknown) => void
  onHide: (id: string) => void
  onShow: (id: string) => void
  ms?: number
}

// Undo before the timer is a local cancel. Undo after commit restores a Push document; an upload is already gone.
export const createUndoDelete = <T extends UndoItem>({
  remove,
  restore = restoreDocument,
  onDone,
  onFail,
  onHide,
  onShow,
  ms = UNDO_MS,
}: UndoMachine<T>) => {
  const timers = new Map<string, { timer: ReturnType<typeof setTimeout>; item: T }>()
  const commits = new Map<string, Commit<T>>()

  const tryRestore = (item: T, removed: unknown) => {
    if (!isPushDocument(item)) return
    void restore(item, removed).then(
      () => {
        onShow(item.id)
        onDone()
      },
      (error: unknown) => {
        onShow(item.id)
        onDone()
        onFail(() => tryRestore(item, removed), error)
      },
    )
  }

  const commit = (item: T) => {
    timers.delete(item.id)
    let resolveRemoved!: (value: unknown) => void
    let rejectRemoved!: (error: unknown) => void
    const removed = new Promise<unknown>((resolve, reject) => {
      resolveRemoved = resolve
      rejectRemoved = reject
    })
    const entry: Commit<T> = { item, removed, undoing: false }
    commits.set(item.id, entry)
    onHide(item.id)
    void remove(item).then(
      (value) => {
        resolveRemoved(value)
        if (!entry.undoing) onDone()
        onShow(item.id)
      },
      (error: unknown) => {
        rejectRemoved(error)
        commits.delete(item.id)
        if (!entry.undoing) onFail(() => commit(item), error)
        onShow(item.id)
      },
    )
  }

  const start = (item: T) => {
    onHide(item.id)
    timers.set(item.id, { timer: setTimeout(() => commit(item), ms), item })
  }

  const undo = (id: string) => {
    const pending = timers.get(id)
    if (pending) {
      clearTimeout(pending.timer)
      timers.delete(id)
      onShow(id)
      return
    }
    const entry = commits.get(id)
    if (!entry || !isPushDocument(entry.item)) return
    entry.undoing = true
    commits.delete(id)
    void entry.removed.then(
      (value) => tryRestore(entry.item, value),
      () => undefined,
    )
  }

  const flush = () => {
    for (const [id, pending] of timers) {
      clearTimeout(pending.timer)
      timers.delete(id)
      void remove(pending.item).catch(() => undefined)
    }
  }

  return { start, undo, flush }
}

export const useUndoDelete = <T extends UndoItem>({ remove, onDone, onFail }: UndoDelete<T>) => {
  const [hidden, setHidden] = useState<string[]>([])
  const latest = useRef({ remove, onDone, onFail })
  useEffect(() => {
    latest.current = { remove, onDone, onFail }
  })

  const machine = useRef<ReturnType<typeof createUndoDelete<T>> | null>(null)
  if (!machine.current) {
    machine.current = createUndoDelete<T>({
      remove: (item) => latest.current.remove(item),
      onDone: () => void latest.current.onDone(),
      onFail: (retry, error) => latest.current.onFail(retry, error),
      onHide: (id) => setHidden((list) => (list.includes(id) ? list : [...list, id])),
      onShow: (id) => setHidden((list) => list.filter((item) => item !== id)),
    })
  }

  useEffect(() => {
    const current = machine.current
    return () => current?.flush()
  }, [])

  return { hidden, start: machine.current.start, undo: machine.current.undo }
}
