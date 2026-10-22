import { useQuery } from '@tanstack/react-query'
import { companiesMembers as fetchMembers } from '../../shared/api/operations'

export const companiesMembers = (...args: Parameters<typeof fetchMembers>) => fetchMembers(...args)

export const useCompanyMembers = () => useQuery({ queryKey: ['company', 'members'], queryFn: () => companiesMembers() })
