import type { SourceItem } from '@push/api-client'
import { postingsApply as call0 } from '../../shared/api/operations'

export const postingsApply = (...args: Parameters<typeof call0>) => call0(...args)

export const applySourceIds = (sources: Pick<SourceItem, 'id' | 'origin'>[], selected: string[]) => {
  const picked = sources.filter((source) => selected.includes(source.id))
  const ids = (ai: boolean) => picked.filter((source) => (source.origin === 'AI') === ai).map((source) => source.id)
  return { documentIds: ids(true), sourceIds: ids(false) }
}
