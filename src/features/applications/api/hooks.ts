import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import {
  createApplication,
  createJob,
  getJob,
  listApplications,
  listJobAnalyses,
  patchApplication,
} from './fetchers'
import type { Application, ApplicationStage, GapAnalysis, JobPosting } from './schemas'
import { canTransition } from '../lib/application-stage'

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

const jobKeys = {
  list: ['jobs'] as const,
  detail: (id: string) => ['jobs', id] as const,
}

export type JobDetail = {
  job: JobPosting
  analyses: GapAnalysis[]
}

export const useJob = (id: string | undefined) =>
  useQuery({
    queryKey: jobKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<JobDetail> => {
      const job = await getJob(id!)
      const analyses = await listJobAnalyses(id!, { limit: 10 })
        .then((env) => env.data)
        .catch(() => [])
      return { job, analyses }
    },
  })

export const useCreateJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: jobKeys.list })
      const previous = qc.getQueryData<JobPosting[]>(jobKeys.list)
      const now = new Date().toISOString()
      const optimistic: JobPosting = {
        id: `optimistic-${crypto.randomUUID()}`,
        revision: 0,
        company: body.company,
        title: body.title,
        sourceKind: body.sourceKind,
        sourceUrl: body.sourceUrl ?? null,
        sourceText: body.sourceText,
        requirements: body.requirements ?? [],
        preferred: body.preferred ?? [],
        keywords: [],
        risks: [],
        deadline: body.deadline ?? null,
        language: body.language ?? null,
        createdAt: now,
        updatedAt: now,
      }
      qc.setQueryData<JobPosting[]>(jobKeys.list, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onSuccess: (created, _body, ctx) => {
      qc.setQueryData<JobPosting[]>(jobKeys.list, (old) =>
        (old ?? []).map((j) => (j.id === ctx?.optimisticId ? created : j)),
      )
    },
    onError: (_error, _body, ctx) => {
      qc.setQueryData<JobPosting[]>(jobKeys.list, (old) =>
        ctx?.previous ?? (old ?? []).filter((j) => j.id !== ctx?.optimisticId),
      )
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: jobKeys.list })
    },
  })
}
