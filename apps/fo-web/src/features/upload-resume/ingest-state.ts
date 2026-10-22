import { isJobSettled, type QueueJob } from '@push/api-client'

export type IngestState = 'reading' | 'failed' | null

export const ingestState = (jobId: string | undefined, job: QueueJob | undefined): IngestState => {
  if (!jobId) return null
  if (!job || !isJobSettled(job)) return 'reading'
  return job.status === 'DONE' ? null : 'failed'
}
