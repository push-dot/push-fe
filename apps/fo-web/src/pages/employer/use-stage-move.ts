import type { EmployerStage } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { postingsSetApplicantStage } from '../../features/change-applicant-stage'

type Move = { applicationId: string; stage: EmployerStage }

// One stage change for the list dropdown and the detail page; both refresh the rows, the tab counts and the detail.
export const useStageMove = (postingId: string | undefined) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ applicationId, stage }: Move) => postingsSetApplicantStage(postingId ?? '', applicationId, stage),
    onSuccess: async () => {
      await Promise.all(
        ['employer-applicants', 'employer-applicant-counts', 'employer-applicant'].map((key) => queryClient.invalidateQueries({ queryKey: [key, postingId] })),
      )
    },
  })
}
