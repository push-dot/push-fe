import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getAssignment, queryClient, trackExperimentEvent } from '@/shared/api'
import { EXPERIMENT_EVENTS } from '@/shared/constants'

const tracked = new Set<string>()

const assignmentQuery = (key: string) => ({
  queryKey: ['experiment', 'assignment', key],
  queryFn: () => getAssignment(key),
  staleTime: Infinity,
  retry: false,
})

export const trackExperiment = (key: string, event: string, scope = '') => {
  const id = `${key}:${scope}:${event}`
  if (tracked.has(id)) return
  tracked.add(id)
  void trackExperimentEvent(key, event).catch(() => tracked.delete(id))
}

export const experimentVariant = async (key: string, fallback = 'A'): Promise<string> => {
  try {
    const data = await queryClient.fetchQuery(assignmentQuery(key))
    return data.variant ?? fallback
  } catch {
    return fallback
  }
}

export const useExperimentVariant = (key: string, fallback = 'A'): string => {
  const { data } = useQuery(assignmentQuery(key))
  return data?.variant ?? fallback
}

export const useExperiment = (key: string, fallback = 'A'): string => {
  const { data } = useQuery(assignmentQuery(key))

  useEffect(() => {
    if (!data?.enrolled) return
    trackExperiment(key, EXPERIMENT_EVENTS.exposure)
  }, [key, data])

  return data?.variant ?? fallback
}

export const useExperimentConversion = (key: string) => {
  const { mutate } = useMutation({
    mutationFn: () => trackExperimentEvent(key, EXPERIMENT_EVENTS.conversion),
  })
  return mutate
}

export const resetExperiments = () => {
  tracked.clear()
}
