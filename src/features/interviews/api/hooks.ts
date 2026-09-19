import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createInterview, listInterviews } from './fetchers'
import type { InterviewSession } from './schemas'

const keys = {
  list: ['interviews'] as const,
}

export const useInterviews = () =>
  useQuery({
    queryKey: keys.list,
    queryFn: () => listInterviews({ limit: 50 }).then((env) => env.data),
  })

export const useCreateInterview = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createInterview,
    onSuccess: (created) => {
      qc.setQueryData<InterviewSession[]>(keys.list, (old) => [created, ...(old ?? [])])
    },
  })
}
