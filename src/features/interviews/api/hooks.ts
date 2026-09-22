import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prefetchList } from '@/shared/api'
import { createInterview, listInterviews } from './fetchers'
import type { InterviewSession } from './schemas'

const keys = {
  list: ['interviews'] as const,
}

const interviewsQuery = {
  queryKey: keys.list,
  queryFn: () => listInterviews({ limit: 50 }).then((env) => env.data),
}

export const useInterviews = () => useQuery(interviewsQuery)

export const prefetchInterviews = () => prefetchList(interviewsQuery)

export const useCreateInterview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInterview,
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: keys.list })
      const previous = qc.getQueryData<InterviewSession[]>(keys.list)
      const now = new Date().toISOString()
      const optimistic: InterviewSession = {
        id: `optimistic-${crypto.randomUUID()}`,
        revision: 0,
        applicationId: body.applicationId,
        title: body.title,
        scheduledAt: body.scheduledAt,
        durationMinutes: body.durationMinutes ?? null,
        eventId: null,
        evidenceIds: body.evidenceIds ?? [],
        notes: body.notes ?? '',
        reflection: '',
        createdAt: now,
        updatedAt: now,
      }
      qc.setQueryData<InterviewSession[]>(keys.list, (old) => [optimistic, ...(old ?? [])])
      return { previous, optimisticId: optimistic.id }
    },
    onSuccess: (created, _body, ctx) => {
      qc.setQueryData<InterviewSession[]>(keys.list, (old) =>
        (old ?? []).map((s) => (s.id === ctx?.optimisticId ? created : s)),
      )
    },
    onError: (_error, _body, ctx) => {
      qc.setQueryData<InterviewSession[]>(keys.list, (old) =>
        ctx?.previous ?? (old ?? []).filter((s) => s.id !== ctx?.optimisticId),
      )
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: keys.list })
    },
  })
}
