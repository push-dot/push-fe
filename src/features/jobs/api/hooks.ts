import { useQuery } from '@tanstack/react-query'
import { getJob, listJobAnalyses } from './fetchers'
import type { GapAnalysis, JobPosting } from './schemas'

const keys = {
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
