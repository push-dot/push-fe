import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchGoogleStatus, listCalendarEvents, syncGoogle } from './fetchers'

const keys = {
  list: ['calendar-events'] as const,
  googleStatus: ['google-status'] as const,
}

const monthRange = (base: Date): { from: string; to: string } => {
  const from = new Date(base.getFullYear(), base.getMonth(), 1)
  const to = new Date(base.getFullYear(), base.getMonth() + 1, 0, 23, 59, 59)
  return { from: from.toISOString(), to: to.toISOString() }
}

export const useCalendarEvents = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => listCalendarEvents(monthRange(new Date())).then((env) => env.data),
  })

export const useGoogleStatus = () =>
  useQuery({ queryKey: keys.googleStatus, queryFn: fetchGoogleStatus })

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
