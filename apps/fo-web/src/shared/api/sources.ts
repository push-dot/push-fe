import type { SourceItem, UploadedSource } from '@push/api-client'
import { sourcesList } from './operations'

export type ListedSource = SourceItem & { jobId?: string }

const SOURCE_LIST_LIMIT = 100

const ingestJobs = new Map<string, string | undefined>()

export const rememberSource = (source: UploadedSource) => {
  ingestJobs.set(source.id, source.jobId)
}

export const listSources = async (kind?: 'UPLOAD' | 'AI'): Promise<ListedSource[]> => {
  const page = await sourcesList({ kind, limit: SOURCE_LIST_LIMIT })
  return page.data.map((item) => ({ ...item, jobId: ingestJobs.get(item.id) }))
}
