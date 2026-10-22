import { JOB_POLL_MS, SETTLED_JOB_STATUSES } from './constants'
import type { QueueJob } from './types'

export const isJobSettled = (job: Pick<QueueJob, 'status'>) =>
  (SETTLED_JOB_STATUSES as readonly string[]).includes(job.status)

export const jobQuery = <R = unknown>(jobs: { get: (id: string) => Promise<QueueJob<R>> }, id: string | null | undefined) => ({
  queryKey: ['ai-job', id] as const,
  queryFn: () => jobs.get(id as string),
  enabled: Boolean(id),
  refetchInterval: (query: { state: { data?: QueueJob<R> } }) =>
    query.state.data && isJobSettled(query.state.data) ? (false as const) : JOB_POLL_MS,
})
