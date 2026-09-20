import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type {
  DocumentKind,
  DocumentTemplate,
  PushDocument,
  DocumentVersion,
  DocumentExport,
} from './schemas'

export const listDocuments = async (
  params: ListParams & { applicationId?: string; kind?: DocumentKind } = {},
): Promise<ListEnvelope<PushDocument>> =>
  request(() =>
    api.get('documents', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
        ...(params.kind ? { kind: params.kind } : {}),
      },
    }),
  )

export const getDocument = async (id: string): Promise<PushDocument> => {
  const env = await request<DataEnvelope<PushDocument>>(() => api.get(`documents/${id}`))
  return env.data
}

export const createDocument = async (body: {
  applicationId: string
  title: string
  kind: DocumentKind
  template: DocumentTemplate
  language?: string
}): Promise<PushDocument> => {
  const env = await request<DataEnvelope<PushDocument>>(() =>
    api.post('documents', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const listDocumentVersions = async (
  documentId: string,
  params: ListParams = {},
): Promise<ListEnvelope<DocumentVersion>> =>
  request(() =>
    api.get(`documents/${documentId}/versions`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )

export const getDocumentVersion = async (
  documentId: string,
  versionId: string,
): Promise<DocumentVersion> => {
  const env = await request<DataEnvelope<DocumentVersion>>(() =>
    api.get(`documents/${documentId}/versions/${versionId}`),
  )
  return env.data
}

export const downloadVersionExport = async (
  documentId: string,
  versionId: string,
  format: 'PDF' | 'DOCX',
  title: string,
): Promise<void> => {
  const resp = await api.get(
    `documents/${documentId}/versions/${versionId}/export`,
    { searchParams: { format } },
  )
  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.${format.toLowerCase()}`
  a.click()
  URL.revokeObjectURL(url)
}

export const createDocumentExport = async (
  documentId: string,
  body: {
    versionId: string
    format: 'PDF' | 'DOCX'
    rendererVersion: string
  },
): Promise<DocumentExport> => {
  const env = await request<DataEnvelope<DocumentExport>>(() =>
    api.post(`documents/${documentId}/exports`, {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}
