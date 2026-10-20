import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import { useHasSession } from '@/shared/auth/session'
import { completeGoogle, connectGoogle, fetchGoogleStatus, listCalendarEvents, syncGoogle } from './fetchers'

const keys = {
  list: ['calendar-events'] as const,
  googleStatus: ['google-status'] as const,
}

const monthRange = (base: Date): { from: string; to: string } => {
  const from = new Date(base.getFullYear(), base.getMonth(), 1)
  const to = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59)
  return { from: from.toISOString(), to: to.toISOString() }
}

const calendarEventsQuery = (base: Date) => ({
  queryKey: [...keys.list, `${base.getFullYear()}-${base.getMonth()}`] as const,
  queryFn: () => listCalendarEvents(monthRange(base)).then((env) => env.data),
})

export const useCalendarEvents = () =>
  useQuery({ ...calendarEventsQuery(new Date()), enabled: useHasSession() })

export const prefetchCalendarEvents = () => prefetchList(calendarEventsQuery(new Date()))

export const useGoogleStatus = () =>
  useQuery({ queryKey: keys.googleStatus, queryFn: fetchGoogleStatus, enabled: useHasSession() })

export const useSyncGoogle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => syncGoogle(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
      void qc.invalidateQueries({ queryKey: keys.googleStatus })
    },
  })
}

export const useConnectGoogle = () =>
  useMutation({ mutationFn: () => connectGoogle() })

export const useCompleteGoogle = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (code: string) => completeGoogle(code),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
      void qc.invalidateQueries({ queryKey: keys.googleStatus })
    },
  })
}
