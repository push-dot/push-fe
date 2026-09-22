import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDocument, getDocument, getDocumentVersion, listDocuments } from './fetchers'
import type { DocumentVersion, PushDocument } from './schemas'

const keys = {
  list: ['documents'] as const,
  detail: (id: string) => ['documents', id] as const,
}

export type DocumentDetail = {
  document: PushDocument
  version: DocumentVersion | null
}

export const useDocuments = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => listDocuments({ limit: 50 }).then((env) => env.data),
  })

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
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: keys.list })
      const previous = qc.getQueryData<PushDocument[]>(keys.list)
      const now = new Date().toISOString()
      const optimistic: PushDocument = {
        id: `optimistic-${crypto.randomUUID()}`,
        revision: 0,
        applicationId: body.applicationId,
        title: body.title,
        kind: body.kind,
        template: body.template,
        language: body.language ?? null,
        status: 'DRAFT',
        latestVersionId: null,
        finalizedVersionId: null,
        createdAt: now,
        updatedAt: now,
      }
      qc.setQueryData<PushDocument[]>(keys.list, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onSuccess: (created, _body, ctx) => {
      qc.setQueryData<PushDocument[]>(keys.list, (old) =>
        (old ?? []).map((d) => (d.id === ctx?.optimisticId ? created : d)),
      )
    },
    onError: (_error, _body, ctx) => {
      qc.setQueryData<PushDocument[]>(keys.list, (old) =>
        ctx?.previous ?? (old ?? []).filter((d) => d.id !== ctx?.optimisticId),
      )
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
    },
  })
}
