import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router-dom'

import { brandOf } from '../shared/lib/format'
import { useSession } from '../shared/auth/use-session'
import { PLAN_NAME, ROLE_NAME } from '../shared/model/employer-plan'
import { NAV } from './constants'
import { companiesMe } from '../shared/api/operations'


const EmployerChip = () => {
  const session = useSession()
  const companyId = session?.user.companyId
  const company = useQuery({ queryKey: ['company', 'me'], queryFn: () => companiesMe(), enabled: Boolean(companyId) })
  const name = company.data?.name || session?.user.displayName || ''
  const plan = company.data?.plan
  const role = company.data?.role ?? session?.user.companyRole
  const sub = [plan ? PLAN_NAME[plan] : null, role === 'ADMIN' || role === 'MEMBER' ? ROLE_NAME[role] : null].filter(Boolean).join(' · ')
  return (
    <NavLink to="/me" className="me-chip biz" aria-label={NAV.my}>
      <span className="av biz-mark" style={{ background: brandOf(name || 'Push') }}>
        {name ? [...name][0] : ''}
      </span>
      <span className="biz-id">
        <span className="c1 w7">{name}</span>
        {sub ? <span className="c2 t3">{sub}</span> : null}
      </span>
      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </NavLink>
  )
}

export default EmployerChip
