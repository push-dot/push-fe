import type { ApplicationStage } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import {
  applicationsList as fetchApplications,
  calendarEvents as fetchCalendar,
  postingsApplicant as fetchApplicant,
  postingsApplicants as fetchApplicants,
} from '../../shared/api/operations'

export const applicationsList = (...args: Parameters<typeof fetchApplications>) => fetchApplications(...args)
export const calendarEvents = (...args: Parameters<typeof fetchCalendar>) => fetchCalendar(...args)
export const postingsApplicant = (...args: Parameters<typeof fetchApplicant>) => fetchApplicant(...args)
export const postingsApplicants = (...args: Parameters<typeof fetchApplicants>) => fetchApplicants(...args)

export const useApplications = (enabled = true) =>
  useQuery({ queryKey: ['applications'], queryFn: () => applicationsList(), enabled })

export const useCalendar = (from: string, to: string, enabled: boolean) =>
  useQuery({
    queryKey: ['calendar', from, to],
    queryFn: () => calendarEvents(from, to),
    enabled,
  })

export const useEmployerApplicant = (postingId: string | undefined, applicationId: string | undefined) =>
  useQuery({
    queryKey: ['employer-applicant', postingId, applicationId],
    queryFn: () => postingsApplicant(postingId ?? '', applicationId ?? ''),
    enabled: Boolean(postingId && applicationId),
  })

export const useEmployerApplicants = (
  postingId: string | undefined,
  stage: ApplicationStage | null | undefined,
  options?: { queryKey?: unknown[]; enabled?: boolean },
) =>
  useQuery({
    queryKey: options?.queryKey ?? ['employer-applicants', postingId, stage],
    queryFn: () => (stage ? postingsApplicants(postingId ?? '', { stage }) : postingsApplicants(postingId ?? '', {})),
    enabled: options?.enabled ?? Boolean(postingId),
  })
