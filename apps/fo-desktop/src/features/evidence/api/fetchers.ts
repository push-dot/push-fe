import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import type { Operation } from '@/shared/api'
import { waitForOperation } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type { CareerEvidence, EvidenceKind, SourceFile } from './schemas'

export const listCareerEvidence = async (
  params: ListParams & { kind?: EvidenceKind; query?: string } = {},
): Promise<ListEnvelope<CareerEvidence>> =>
  request(() =>
    api.get('career-evidence', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.kind ? { kind: params.kind } : {}),
        ...(params.query ? { query: params.query } : {}),
      },
    }),
  )

export const createCareerEvidence = async (body: {
  kind: EvidenceKind
  title: string
  sourceText: string
  sourceUrl?: string
  skills?: string[]
  supersedesId?: string
}): Promise<CareerEvidence> => {
  const env = await request<DataEnvelope<CareerEvidence>>(() =>
    api.post('career-evidence', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const archiveCareerEvidence = async (
  id: string,
  expectedRevision: number,
): Promise<CareerEvidence> => {
  const env = await request<DataEnvelope<CareerEvidence>>(() =>
    api.post(`career-evidence/${id}/archive`, {
      json: { expectedRevision },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

const isEvidenceImportResult = (
  result: unknown,
): result is { value?: { evidence?: CareerEvidence[] } } => {
  if (typeof result !== 'object' || result === null) return false
  const { value } = result as { value?: unknown }
  if (value === undefined) return true
  if (typeof value !== 'object' || value === null) return false
  const { evidence } = value as { evidence?: unknown }
  return evidence === undefined || Array.isArray(evidence)
}

export const importEvidence = async (file: File, sourceId: string): Promise<CareerEvidence> => {
  const env = await request<DataEnvelope<Operation>>(() =>
    api.post('career-evidence/import', {
      json: {
        sourceId,
        text: '',
        contentHash: '',
        format: file.name.toLowerCase().endsWith('.pdf') ? 'PDF' : 'TEXT',
        kind: 'RESUME',
        title: file.name,
      },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  const operation =
    env.data.status === 'QUEUED' || env.data.status === 'RUNNING'
      ? await waitForOperation(env.data.id)
      : env.data
  const result = isEvidenceImportResult(operation.result) ? operation.result : null
  const evidence = result?.value?.evidence ?? []
  if (operation.status !== 'SUCCEEDED' || evidence.length === 0) {
    throw new Error(operation.error?.message ?? 'evidence import failed')
  }
  return evidence[0]
}

export const uploadSource = async (file: File, kind: EvidenceKind): Promise<SourceFile> => {
  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind)
  const env = await request<DataEnvelope<SourceFile>>(() =>
    api.post('sources', {
      body: form,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
      timeout: 60_000,
    }),
  )
  return env.data
}
