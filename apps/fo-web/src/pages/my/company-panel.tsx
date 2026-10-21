import { Link } from 'react-router-dom'

import { useMyCompany } from '../../entities/company'
import { brandOf } from '../../shared/lib/format'
import { useSession } from '../../shared/auth/use-session'
import { formatBno } from '../../features/verify-business'
import { COMPANY_LOCKED, COMPANY_NO_HUB, COMPANY_UNVERIFIED, COMPANY_VERIFIED, PLAN_NONE } from './constants'


const CompanyPanel = () => {
  const session = useSession()
  const companyId = session?.user.companyId
  const query = useMyCompany({ enabled: Boolean(companyId) })
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
      <div className="box company-hero">
        <span className="av biz-mark" style={{ background: brandOf(company.name) }}>
          {[...company.name][0]}
        </span>
        <span>
          <span className="h3">{company.name}</span>
          <span className="c1 t3">{company.plan ?? PLAN_NONE}</span>
        </span>
      </div>
      <dl className="facts">
        <div>
          <dt>사업자등록번호</dt>
          <dd>
            {formatBno(company.bNo)}
            {company.verifiedAt ? <span className="badge green">{COMPANY_VERIFIED}</span> : null}
          </dd>
        </div>
        <div>
          <dt>요금제</dt>
          <dd>{company.plan ?? PLAN_NONE}</dd>
        </div>
      </dl>
      <p className="c1 t3">{COMPANY_LOCKED}</p>
      <p className="c1 t3">{COMPANY_NO_HUB}</p>
    </section>
  )
}

export default CompanyPanel
