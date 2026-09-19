import { api } from './client'
import { request } from './envelope'
import type { DataEnvelope } from './envelope'

export type ExperimentAssignment = {
  experimentKey: string
  variant: string
  createdAt: string
}

export const getAssignment = async (key: string): Promise<string> => {
  const env = await request<DataEnvelope<ExperimentAssignment>>(() =>
    api.get(`experiments/${key}/assignment`),
  )
  return env.data.variant
}

export const trackExperimentEvent = async (key: string, event: string): Promise<void> => {
  await request<DataEnvelope<{ recorded: boolean }>>(() =>
    api.post(`experiments/${key}/events`, { json: { event } }),
  )
}
