import { api } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope } from '@/shared/api'
import type { EvidenceKind } from './api'
import { newIdempotencyKey } from '@/shared/lib/id'

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
