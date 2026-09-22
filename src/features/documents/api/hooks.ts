import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import { createDocument, getDocument, getDocumentVersion, listDocuments } from './fetchers'
import type { DocumentVersion, PushDocument } from './schemas'

const keys = {
  list: ['documents'] as const,
  detail: (id: string) => ['documents', id] as const,
}

const documentsQuery = {
  queryKey: keys.list,
  queryFn: () => listDocuments({ limit: 50 }).then((env) => env.data),
}

export type DocumentDetail = {
  document: PushDocument
  version: DocumentVersion | null
}

export const useDocuments = () => useQuery(documentsQuery)

export const prefetchDocuments = () => prefetchList(documentsQuery)

export const useDocument = (id: string | undefined) =>
  useQuery({
    queryKey: keys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<DocumentDetail> => {
      const document = await getDocument(id!)
      const version = document.latestVersionId
        ? await getDocumentVersion(id!, document.latestVersionId)
        : null
      return { document, version }
    },
  })

export const useCreateDocument = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createDocument,
    onSuccess: (created) => {
      qc.setQueryData<PushDocument[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}
