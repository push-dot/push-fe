import { jobQuery } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { api } from './client'

export const useJob = (jobId: string | null | undefined) => useQuery(jobQuery(api.jobs, jobId))
