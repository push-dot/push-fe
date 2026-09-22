import { importEvidence, uploadSource } from '@/features/evidence'
import type { CareerEvidence } from '@/features/evidence'

type UploadDeps = {
  uploadSource: typeof uploadSource
  importEvidence: typeof importEvidence
}

export type PendingUploadResult = {
  evidence: Pick<CareerEvidence, 'id' | 'title'>[]
  failed: { file: File; error: unknown }[]
}

export const uploadPendingFiles = async (
  files: File[],
  deps: UploadDeps = { uploadSource, importEvidence },
): Promise<PendingUploadResult> => {
  const results = await Promise.allSettled(
    files.map(async (f) => {
      const source = await deps.uploadSource(f, 'RESUME')
      const ev = await deps.importEvidence(f, source.id)
      return { id: ev.id, title: ev.title }
    }),
  )
  const evidence: PendingUploadResult['evidence'] = []
  const failed: PendingUploadResult['failed'] = []
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') evidence.push(result.value)
    else failed.push({ file: files[i], error: result.reason })
  })
  return { evidence, failed }
}
