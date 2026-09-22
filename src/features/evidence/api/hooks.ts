import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import { archiveCareerEvidence, createCareerEvidence, listCareerEvidence } from './fetchers'
import type { CareerEvidence } from './schemas'

const keys = {
  list: ['career-evidence'] as const,
}

const careerEvidenceQuery = {
  queryKey: keys.list,
  queryFn: () => listCareerEvidence({ limit: 50 }).then((env) => env.data),
}

export const useCareerEvidence = () => useQuery(careerEvidenceQuery)

export const prefetchCareerEvidence = () => prefetchList(careerEvidenceQuery)

export const useArchiveEvidence = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, revision }: { id: string; revision: number }) =>
      archiveCareerEvidence(id, revision),
    onSuccess: (_, { id }) => {
      qc.setQueryData<CareerEvidence[]>(keys.list, (old) =>
        (old ?? []).filter((e) => e.id !== id),
      )
    },
  })
}

export const useCreateEvidence = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCareerEvidence,
    onSuccess: (created) => {
      qc.setQueryData<CareerEvidence[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}
