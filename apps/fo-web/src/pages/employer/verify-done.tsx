import type { Company } from '@push/api-client'
import { Link } from 'react-router-dom'
import {
  LABEL_BNO,
  LABEL_ROLE,
  LABEL_STATUS,
  PLANS_LINK,
  ROLE_ADMIN,
  ROLE_MEMBER,
  VERIFY_AI_POSTING,
  VERIFY_DONE_ADMIN,
  VERIFY_DONE_LEAD,
  VERIFY_FIRST_POSTING,
  VERIFY_STATUS,
} from './constants'
import { formatBno } from '../../features/verify-business'
import { AgentMark } from '../../shared/ui/icon'

const VerifyDone = ({ company }: { company: Company }) => (
  <>
    <div className="auth-center">
      <span className="auth-icon ok" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </span>
      <h1>{company.name ? `${company.name} 확인 완료` : '확인 완료'}</h1>
      <p className="auth-mail-copy">
        {VERIFY_DONE_LEAD}
        <br />
        {VERIFY_DONE_ADMIN}
      </p>
    </div>
    <dl className="auth-facts">
      <div>
        <dt>{LABEL_BNO}</dt>
        <dd className="num">{formatBno(company.bNo)}</dd>
      </div>
      <div>
        <dt>{LABEL_STATUS}</dt>
        <dd>
          <span className="auth-badge-green">{VERIFY_STATUS}</span>
        </dd>
      </div>
      <div>
        <dt>{LABEL_ROLE}</dt>
        <dd>{company.role === 'ADMIN' ? ROLE_ADMIN : ROLE_MEMBER}</dd>
      </div>
    </dl>
    <div className="auth-stack tight">
      <Link className="auth-btn pri" to="/employer/postings/new">
        {VERIFY_FIRST_POSTING}
      </Link>
      <Link className="auth-btn sec icon" to="/employer/chat/new">
        <AgentMark />
        {VERIFY_AI_POSTING}
      </Link>
    </div>
    <Link className="auth-text" to="/employer/plans">
      {PLANS_LINK}
    </Link>
  </>
)

export default VerifyDone
