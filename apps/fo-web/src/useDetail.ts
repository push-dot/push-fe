import { ApiError } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { send } from './bridge'

/** Loads page data and reports title/error to the native shell. */
export const useDetail = <T,>(key: unknown[], load: () => Promise<T>, titleOf: (data: T) => string) => {
  const q = useQuery({ queryKey: key, queryFn: load })
  const title = q.data ? titleOf(q.data) : undefined
  useEffect(() => {
    if (title) send({ type: 'title', title })
  }, [title])
  useEffect(() => {
    if (q.error) send({ type: 'error', status: q.error instanceof ApiError ? q.error.status : 0 })
  }, [q.error])
  return q
}
