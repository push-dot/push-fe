import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createJob, getJob, listJobAnalyses } from './fetchers'
import type { GapAnalysis, JobPosting } from './schemas'

const keys = {
  list: ['jobs'] as const,
  detail: (id: string) => ['jobs', id] as const,
}

export type JobDetail = {
  job: JobPosting
  analyses: GapAnalysis[]
}

export const useJob = (id: string | undefined) =>
  useQuery({
    queryKey: keys.detail(id ?? ''),
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
      await qc.cancelQueries({ queryKey: keys.list })
      const previous = qc.getQueryData<JobPosting[]>(keys.list)
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
      qc.setQueryData<JobPosting[]>(keys.list, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onSuccess: (created, _body, ctx) => {
      qc.setQueryData<JobPosting[]>(keys.list, (old) =>
        (old ?? []).map((j) => (j.id === ctx?.optimisticId ? created : j)),
      )
    },
    onError: (_error, _body, ctx) => {
      qc.setQueryData<JobPosting[]>(keys.list, (old) =>
        ctx?.previous ?? (old ?? []).filter((j) => j.id !== ctx?.optimisticId),
      )
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
    },
  })
}
