import { ApiError, type EmployerPlan } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../api'

export const useEmployerPlan = () => {
  const company = useQuery({ queryKey: ['company', 'me'], queryFn: () => api.companies.me() })
  const missing = company.error instanceof ApiError && company.error.status === 404
  const settled = company.isSuccess || missing
  const plan: EmployerPlan | null = settled ? company.data?.plan ?? null : null
  return { plan, settled, verified: settled && company.isSuccess, failed: company.isError && !missing }
}
