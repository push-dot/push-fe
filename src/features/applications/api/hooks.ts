import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import { createApplication, listApplications, patchApplication } from './fetchers'
import type { Application, ApplicationStage } from './schemas'
import { canTransition } from '../application-stage'

const keys = {
  list: ['applications'] as const,
}

const applicationsQuery = {
  queryKey: keys.list,
  queryFn: () => listApplications({ limit: 50 }).then((env) => env.data),
}

export const useApplications = () => useQuery(applicationsQuery)

export const prefetchApplications = () => prefetchList(applicationsQuery)

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => createApplication({ jobId }),
    onSuccess: (created) => {
      qc.setQueryData<Application[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}

export const useMoveStage = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, to }: { id: string; to: ApplicationStage }) => {
      const target = qc.getQueryData<Application[]>(keys.list)?.find((a) => a.id === id)
      if (!target || !canTransition(target.stage, to)) return null
      return patchApplication(id, { expectedRevision: target.revision, stage: to })
    },
    onSuccess: (updated) => {
      if (!updated) return
      qc.setQueryData<Application[]>(keys.list, (old) =>
        (old ?? []).map((a) => (a.id === updated.id ? updated : a)),
      )
    },
  })
}
