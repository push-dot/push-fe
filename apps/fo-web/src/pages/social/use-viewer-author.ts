import type { SocialAuthor } from '@push/api-client'

import { useMyCompany } from '../../entities/company'
import { useSession } from '../../shared/auth/use-session'

export const useViewerAuthor = (): SocialAuthor => {
  const session = useSession()
  const employer = session?.user.accountType === 'EMPLOYER'
  const company = useMyCompany({ enabled: employer && Boolean(session?.user.companyId) })
  const id = session?.user.id ?? ''
  const displayName = session?.user.displayName ?? '나'
  return employer ? { id, displayName, employer: true, companyName: company.data?.name ?? null } : { id, displayName }
}
