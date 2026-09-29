import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { JobPosting, GapAnalysis } from './schemas'

export const listJobs = async (
  params: ListParams & { query?: string; archived?: boolean } = {},
): Promise<ListEnvelope<JobPosting>> =>
  request(() =>
    api.get('jobs', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.query ? { query: params.query } : {}),
        ...(params.archived !== undefined ? { archived: String(params.archived) } : {}),
      },
    }),
  )

export const getJob = async (id: string): Promise<JobPosting> => {
  const env = await request<DataEnvelope<JobPosting>>(() => api.get(`jobs/${id}`))
  return env.data
}

export const createJob = async (body: {
  company: string
  title: string
  sourceKind: 'URL' | 'TEXT' | 'DOM'
  sourceUrl?: string
  sourceText: string
  requirements?: string[]
  preferred?: string[]
  deadline?: string
  language?: string
}): Promise<JobPosting> => {
  const env = await request<DataEnvelope<JobPosting>>(() =>
    api.post('jobs', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const listJobAnalyses = async (
  jobId: string,
  params: ListParams = {},
): Promise<ListEnvelope<GapAnalysis>> =>
  request(() =>
    api.get(`jobs/${jobId}/analyses`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )
