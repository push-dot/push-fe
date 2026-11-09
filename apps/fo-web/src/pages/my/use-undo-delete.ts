import { useCallback, useEffect, useRef, useState } from 'react'
import { UNDO_MS } from './constants'

type UndoDelete = {
  remove: (id: string) => Promise<unknown>
  onDone: () => Promise<unknown> | void
  onFail: (retry: () => void) => void
}

export const useUndoDelete = ({ remove, onDone, onFail }: UndoDelete) => {
  const [hidden, setHidden] = useState<string[]>([])
  const timers = useRef(new Map<string, number>())
  const latest = useRef({ remove, onDone, onFail })
  useEffect(() => {
    latest.current = { remove, onDone, onFail }
  })

  const commit = useCallback((id: string) => {
    timers.current.delete(id)
    setHidden((list) => (list.includes(id) ? list : [...list, id]))
    latest.current
      .remove(id)
      .then(() => latest.current.onDone())
      .catch(() => latest.current.onFail(() => commit(id)))
      .finally(() => setHidden((list) => list.filter((item) => item !== id)))
  }, [])

  const start = useCallback(
    (id: string) => {
      setHidden((list) => [...list, id])
      timers.current.set(
        id,
        window.setTimeout(() => commit(id), UNDO_MS),
      )
    },
    [commit],
  )

  const undo = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setHidden((list) => list.filter((item) => item !== id))
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const [id, timer] of pending) {
        window.clearTimeout(timer)
        void latest.current.remove(id).catch(() => undefined)
      }
    }
  }, [])

  return { hidden, start, undo }
}
