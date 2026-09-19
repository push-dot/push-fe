import { useEffect, useState } from 'react'
import { getAssignment, trackExperimentEvent } from '@/shared/api'

const assignments = new Map<string, string>()
const pending = new Map<string, Promise<string>>()
const exposed = new Set<string>()

const resolveAssignment = (key: string): Promise<string> => {
  const cached = assignments.get(key)
  if (cached) return Promise.resolve(cached)
  let p = pending.get(key)
  if (!p) {
    p = getAssignment(key)
      .then((variant) => {
        assignments.set(key, variant)
        return variant
      })
      .finally(() => pending.delete(key))
    pending.set(key, p)
  }
  return p
}

export const useExperiment = (key: string, fallback = 'A'): string => {
  const [variant, setVariant] = useState(assignments.get(key) ?? fallback)

  useEffect(() => {
    let alive = true
    resolveAssignment(key)
      .then((v) => {
        if (alive) setVariant(v)
        if (!exposed.has(key)) {
          exposed.add(key)
          void trackExperimentEvent(key, 'exposure').catch(() => exposed.delete(key))
        }
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [key])

  return variant
}

export const resetExperiments = () => {
  assignments.clear()
  pending.clear()
  exposed.clear()
}
