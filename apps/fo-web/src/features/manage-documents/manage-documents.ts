import type { SourceItem } from '@push/api-client'
import {
  applicationsList,
  documentsExportFile,
  documentsGet,
  documentsRename,
  sourcesContent,
  sourcesRemove,
} from '../../shared/api/operations'

const APPLICATION_LOOKUP_LIMIT = 100
const REVOKE_AFTER_MS = 60_000

export const isPushDocument = (item: Pick<SourceItem, 'origin'>) => item.origin === 'AI'

export const removeDocument = (id: string) => sourcesRemove(id)

export const renameDocument = (id: string, title: string) => documentsRename(id, title)

const documentResponse = async (item: SourceItem) => {
  if (!isPushDocument(item)) return sourcesContent(item.id)
  const doc = await documentsGet(item.id)
  const version = doc.finalizedVersionId ?? doc.latestVersionId
  if (!version) throw new Error('document has no version')
  return documentsExportFile(item.id, version, 'PDF')
}

export const openDocument = async (item: SourceItem, download: boolean) => {
  const tab = download ? null : window.open('', '_blank')
  try {
    const url = URL.createObjectURL(await (await documentResponse(item)).blob())
    window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_AFTER_MS)
    if (tab) {
      tab.location.href = url
      return
    }
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = isPushDocument(item) ? `${item.fileName}.pdf` : item.fileName
    anchor.click()
  } catch (error) {
    tab?.close()
    throw error
  }
}

export const documentPostingId = async (item: Pick<SourceItem, 'company' | 'postingTitle'>) => {
  const page = await applicationsList({ limit: APPLICATION_LOOKUP_LIMIT })
  return (
    page.data.find(
      (application) =>
        application.company === item.company && application.title === item.postingTitle,
    )?.jobId ?? null
  )
}
