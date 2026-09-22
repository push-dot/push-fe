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
    onSuccess: (created) => {
      qc.setQueryData<InterviewSession[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}
