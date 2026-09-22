import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApplication, listApplications, patchApplication } from './fetchers'
import type { Application, ApplicationStage } from './schemas'
import { canTransition } from '../application-stage'

const keys = {
  list: ['applications'] as const,
}

const list = () => listApplications({ limit: 50 }).then((env) => env.data)

export const useApplications = () => useQuery({ queryKey: keys.list, queryFn: list })

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (jobId: string) => createApplication({ jobId }),
    onMutate: async (jobId) => {
      await qc.cancelQueries({ queryKey: keys.list })
      const previous = qc.getQueryData<Application[]>(keys.list)
      const job = qc.getQueryData<{ job: { company: string; title: string } }>(['jobs', jobId])?.job
      const now = new Date().toISOString()
      const optimistic: Application = {
        id: `optimistic-${crypto.randomUUID()}`,
        revision: 0,
        jobId,
        company: job?.company ?? '',
        title: job?.title ?? '',
        stage: 'DISCOVERED',
        notes: '',
        appliedAt: null,
        nextActionAt: null,
        createdAt: now,
        updatedAt: now,
      }
      qc.setQueryData<Application[]>(keys.list, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onSuccess: (created, _jobId, ctx) => {
      qc.setQueryData<Application[]>(keys.list, (old) =>
        (old ?? []).map((a) => (a.id === ctx?.optimisticId ? created : a)),
      )
    },
    onError: (_error, _jobId, ctx) => {
      qc.setQueryData<Application[]>(keys.list, (old) =>
        ctx?.previous ?? (old ?? []).filter((a) => a.id !== ctx?.optimisticId),
      )
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
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
