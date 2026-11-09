import { useQuery } from '@tanstack/react-query'
import { companiesInvites, companiesMembers as fetchMembers } from '../../shared/api/operations'

export const companiesMembers = (...args: Parameters<typeof fetchMembers>) => fetchMembers(...args)

export const useCompanyMembers = (options?: { enabled?: boolean }) =>
  useQuery({ queryKey: ['company', 'members'], queryFn: () => companiesMembers(), ...(options ?? {}) })

/** Pending invites; push-be serves the list to an ADMIN only. */
export const useCompanyInvites = (enabled: boolean) =>
  useQuery({ queryKey: ['company', 'invites'], queryFn: () => companiesInvites(), enabled })
