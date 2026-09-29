import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { CliProvider, CliRun, ProjectBlueprint, ProjectEvidence } from './schemas'

export const listProjects = async (
  params: ListParams & { applicationId?: string } = {},
): Promise<ListEnvelope<ProjectBlueprint>> =>
  request(() =>
    api.get('projects', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const listProjectRuns = async (
  projectId: string,
  params: ListParams = {},
): Promise<ListEnvelope<CliRun>> =>
  request(() =>
    api.get(`projects/${projectId}/runs`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )

export const createProjectRun = async (
  projectId: string,
  body: {
    provider: CliProvider
    workingDirectory: string
    prompt: string
  },
): Promise<CliRun> => {
  const env = await request<DataEnvelope<CliRun>>(() =>
    api.post(`projects/${projectId}/runs`, {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const listProjectEvidence = async (
  projectId: string,
  params: ListParams = {},
): Promise<ListEnvelope<ProjectEvidence>> =>
  request(() =>
    api.get(`projects/${projectId}/evidence`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )
