import type { QueryClient } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/shared/infrastructure'
import { HOME_SNAPSHOT_VERSION } from './snapshot/constants'
import { collectHomeSnapshotPayload, hydrateHomeQueries } from './snapshot/hydrate'
import { clearHomeSnapshot, readHomeSnapshot, writeHomeSnapshot } from './snapshot/store'

const isHomeQueryKey = (key: readonly unknown[]) =>
  (key[0] === 'postings' && key[1] === 'home') || key[0] === 'notifications'

const schedulePersist = (qc: QueryClient, userId: string, timers: Map<string, ReturnType<typeof setTimeout>>) => {
  const prev = timers.get(userId)
  if (prev) clearTimeout(prev)
  timers.set(
    userId,
    setTimeout(() => {
      timers.delete(userId)
      const payload = collectHomeSnapshotPayload(qc)
      if (!payload) return
      void writeHomeSnapshot(userId, { version: HOME_SNAPSHOT_VERSION, ...payload })
    }, 400),
  )
}

export const useHomeSnapshotSync = () => {
  const qc = useQueryClient()
  const userId = useSession((s) => s.session?.user.id ?? null)
  const [hydratedUser, setHydratedUser] = useState<string | null>(null)
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const ready = !userId || hydratedUser === userId

  useEffect(() => {
    return useSession.subscribe((next, prev) => {
      const id = prev.session?.user.id
      if (id && !next.session) void clearHomeSnapshot(id)
    })
  }, [])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void (async () => {
      const snapshot = await readHomeSnapshot(userId)
      if (cancelled) return
      if (snapshot) hydrateHomeQueries(qc, snapshot)
      if (!cancelled) setHydratedUser(userId)
    })()
    return () => {
      cancelled = true
    }
  }, [qc, userId])

  useEffect(() => {
    if (!userId) return
    return qc.getQueryCache().subscribe((event) => {
      if (event.type !== 'updated' && event.type !== 'added') return
      const query = event.query
      if (query.state.status !== 'success') return
      if (!isHomeQueryKey(query.queryKey)) return
      schedulePersist(qc, userId, timers.current)
    })
  }, [qc, userId])

  useEffect(
    () => () => {
      timers.current.forEach((t) => clearTimeout(t))
      timers.current.clear()
    },
    [],
  )

  return ready
}
