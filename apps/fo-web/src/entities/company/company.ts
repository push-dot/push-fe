import { ApiError, type EmployerPlan } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { companiesMe as fetchMyCompany } from '../../shared/api/operations'

type CompanyQueryOptions = {
  enabled?: boolean
  retry?: (failureCount: number, error: Error) => boolean
}

export const companiesMe = (...args: Parameters<typeof fetchMyCompany>) => fetchMyCompany(...args)

export const useMyCompany = (options?: CompanyQueryOptions) =>
  useQuery({
    queryKey: ['company', 'me'],
    queryFn: () => companiesMe(),
    ...(options ?? {}),
  })

export const useEmployerPlan = () => {
  const company = useMyCompany()
  const missing = company.error instanceof ApiError && company.error.status === 404
  const settled = company.isSuccess || missing
  const plan: EmployerPlan | null = settled ? (company.data?.plan ?? null) : null
  return { plan, settled, verified: settled && company.isSuccess, failed: company.isError && !missing }
}
