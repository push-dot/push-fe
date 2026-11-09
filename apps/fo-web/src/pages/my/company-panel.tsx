import { brandColor } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useMyCompany } from '../../entities/company'
import { changeCompanyLogo } from '../../features/edit-company'
import { useSession } from '../../shared/auth/use-session'
import { formatBno } from '../../features/verify-business'
import { Icon } from '../../shared/ui/icon'
import Toast, { useToast } from '../../shared/ui/toast'
import {
  COMPANY_INDUSTRY,
  COMPANY_INTRO,
  COMPANY_LOCKED,
  COMPANY_LOGO,
  COMPANY_LOGO_FAILED,
  COMPANY_NO_HUB,
  COMPANY_REPRESENTATIVE,
  COMPANY_UNVERIFIED,
  COMPANY_VERIFIED,
  COMPANY_WEBSITE,
} from './constants'

const Fact = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const CompanyPanel = () => {
  const session = useSession()
  const companyId = session?.user.companyId
  const query = useMyCompany({ enabled: Boolean(companyId) })
  const queryClient = useQueryClient()
  const toast = useToast()
  const file = useRef<HTMLInputElement>(null)
  const logo = useMutation({
    mutationFn: changeCompanyLogo,
    onSuccess: (company) => queryClient.setQueryData(['company', 'me'], company),
    onError: () => toast.show(COMPANY_LOGO_FAILED, { tone: 'err' }),
  })
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
  const sub = [company.industry, company.website].filter(Boolean).join(' · ')
  return (
    <section className="stack company-panel">
      <div className="box company-hero">
        {company.logoUrl ? (
          <img className="av" src={company.logoUrl} alt="" />
        ) : (
          <span className="av" style={{ background: brandColor(company.name) }}>
            {[...company.name][0]}
          </span>
        )}
        <span className="company-name">
          <span className="h2">{company.legalName ?? company.name}</span>
          {sub ? <span className="b2 t3">{sub}</span> : null}
        </span>
        {company.role === 'ADMIN' ? (
          <>
            <button type="button" className="btn sec sm" disabled={logo.isPending} onClick={() => file.current?.click()}>
              <Icon name="upload" size={16} />
              {COMPANY_LOGO}
            </button>
            <input
              ref={file}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={(event) => {
                const picked = event.target.files?.[0]
                event.target.value = ''
                if (picked) logo.mutate(picked)
              }}
            />
          </>
        ) : null}
      </div>
      <dl className="box facts">
        <Fact label="사업자등록번호">
          <span className="num">{formatBno(company.bNo)}</span>
          {company.verifiedAt ? <span className="badge green">{COMPANY_VERIFIED}</span> : null}
        </Fact>
        {company.representativeName ? <Fact label={COMPANY_REPRESENTATIVE}>{company.representativeName}</Fact> : null}
        {company.industry ? (
          <Fact label={COMPANY_INDUSTRY}>
            <span className="chip">{company.industry}</span>
          </Fact>
        ) : null}
        {company.website ? <Fact label={COMPANY_WEBSITE}>{company.website}</Fact> : null}
        {company.intro ? (
          <Fact label={COMPANY_INTRO}>
            <span className="t2">{company.intro}</span>
          </Fact>
        ) : null}
      </dl>
      <p className="c1 t3">
        {COMPANY_LOCKED} {COMPANY_NO_HUB}
      </p>
      <Toast message={toast.message} tone={toast.tone} />
    </section>
  )
}

export default CompanyPanel
