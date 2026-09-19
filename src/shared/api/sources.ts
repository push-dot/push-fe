import { api } from './client'
import { request } from './envelope'
import type { DataEnvelope } from './envelope'
import type { EvidenceKind } from './career-evidence'
import { newIdempotencyKey } from '../lib/id'

export type SourceFile = {
  id: string
  fileName: string
  mimeType: string
  size: number
  sha256: string
  status: string
}

export const uploadSource = async (file: File, kind: EvidenceKind): Promise<SourceFile> => {
  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind)
  const env = await request<DataEnvelope<SourceFile>>(() =>
    api.post('sources', { body: form, headers: { 'Idempotency-Key': newIdempotencyKey() } }),
  )
  return env.data
}
