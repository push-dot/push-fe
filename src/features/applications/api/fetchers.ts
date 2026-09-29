import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { AiOptions } from '@/features/inference'
import type { Operation } from '@/shared/api'
import type { ApplicationStage, Application } from './schemas'

export const listApplications = async (
  params: ListParams & { stage?: ApplicationStage; query?: string } = {},
): Promise<ListEnvelope<Application>> =>
  request(() =>
    api.get('applications', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.stage ? { stage: params.stage } : {}),
        ...(params.query ? { query: params.query } : {}),
      },
    }),
  )

export const getApplication = async (id: string): Promise<Application> => {
  const env = await request<DataEnvelope<Application>>(() => api.get(`applications/${id}`))
  return env.data
}

export const createApplication = async (body: {
  jobId: string
  notes?: string
}): Promise<Application> => {
  const env = await request<DataEnvelope<Application>>(() =>
    api.post('applications', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const resumeRun = async (
  id: string,
  ai?: AiOptions | null,
  byokKey?: string,
): Promise<Operation> => {
  const env = await request<DataEnvelope<Operation>>(() =>
    api.post(`applications/${id}/resume-run`, {
      json: { ai: ai ?? null },
      headers: {
        'Idempotency-Key': newIdempotencyKey(),
        ...(byokKey ? { 'X-Byok-Key': byokKey } : {}),
      },
    }),
  )
  return env.data
}

export const patchApplication = async (
  id: string,
  body: {
    expectedRevision: number
    stage?: ApplicationStage
    notes?: string
    nextActionAt?: string
  },
): Promise<Application> => {
  const env = await request<DataEnvelope<Application>>(() =>
    api.patch(`applications/${id}`, { json: body }),
  )
  return env.data
}

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
