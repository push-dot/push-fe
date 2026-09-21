import { useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getAssignment, trackExperimentEvent } from '@/shared/api'
import { EXPERIMENT_EVENTS } from '@/shared/constants'

const exposed = new Set<string>()

export const useExperiment = (key: string, fallback = 'A'): string => {
  const { data } = useQuery({
    queryKey: ['experiment', 'assignment', key],
    queryFn: () => getAssignment(key),
    staleTime: Infinity,
    retry: false,
  })

  useEffect(() => {
    if (!data?.enrolled || exposed.has(key)) return
    exposed.add(key)
    void trackExperimentEvent(key, EXPERIMENT_EVENTS.exposure).catch(() =>
      exposed.delete(key),
    )
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
  exposed.clear()
}
