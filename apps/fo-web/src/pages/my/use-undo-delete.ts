import { useCallback, useEffect, useRef, useState } from 'react'
import { UNDO_MS } from './constants'

type UndoDelete<T> = {
  remove: (item: T) => Promise<unknown>
  onDone: () => Promise<unknown> | void
  onFail: (retry: () => void) => void
}

export const useUndoDelete = <T extends { id: string }>({ remove, onDone, onFail }: UndoDelete<T>) => {
  const [hidden, setHidden] = useState<string[]>([])
  const timers = useRef(new Map<string, { timer: number; item: T }>())
  const latest = useRef({ remove, onDone, onFail })
  useEffect(() => {
    latest.current = { remove, onDone, onFail }
  })

  const commit = useCallback((item: T) => {
    timers.current.delete(item.id)
    setHidden((list) => (list.includes(item.id) ? list : [...list, item.id]))
    latest.current
      .remove(item)
      .then(() => latest.current.onDone())
      .catch(() => latest.current.onFail(() => commit(item)))
      .finally(() => setHidden((list) => list.filter((id) => id !== item.id)))
  }, [])

  const start = useCallback(
    (item: T) => {
      setHidden((list) => [...list, item.id])
      timers.current.set(item.id, { timer: window.setTimeout(() => commit(item), UNDO_MS), item })
    },
    [commit],
  )

  const undo = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id)?.timer)
    timers.current.delete(id)
    setHidden((list) => list.filter((item) => item !== id))
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const { timer, item } of pending.values()) {
        window.clearTimeout(timer)
        void latest.current.remove(item).catch(() => undefined)
      }
    }
  }, [])

  return { hidden, start, undo }
}
