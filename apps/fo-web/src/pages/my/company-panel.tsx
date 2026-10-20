import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { useSession } from '../../shared/auth/use-session'
import { COMPANY_UNVERIFIED, PLAN_NONE } from './constants'

const CompanyPanel = () => {
  const session = useSession()
  const companyId = session?.user.companyId
  const query = useQuery({ queryKey: ['company', 'me'], queryFn: () => api.companies.me(), enabled: Boolean(companyId) })
  if (!companyId) {
    return (
      <section className="stack">
        <p className="b1">{COMPANY_UNVERIFIED}</p>
        <Link to="/employer/verify" className="text-link">
          사업자 인증
        </Link>
      </section>
    )
  }
  if (query.isError) return <p className="b2 t3">회사 정보를 불러오지 못했어요.</p>
  if (!query.data) return <p className="b2 t3" aria-busy="true">회사 정보를 불러오고 있어요.</p>
  const company = query.data
  return (
    <section className="stack">
      <h2 className="h3">회사 정보</h2>
      <dl className="facts">
        <div>
          <dt>상호</dt>
          <dd>{company.name}</dd>
        </div>
        <div>
          <dt>사업자번호</dt>
          <dd>{company.bNo}</dd>
        </div>
        <div>
          <dt>요금제</dt>
          <dd>{company.plan ?? PLAN_NONE}</dd>
        </div>
      </dl>
      <div className="link-row">
        <Link to="/employer/members">담당자 관리</Link>
        <Link to="/employer/plans">기업 요금제</Link>
      </div>
    </section>
  )
}

export default CompanyPanel
