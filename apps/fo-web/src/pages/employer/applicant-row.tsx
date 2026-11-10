import { brandColor } from '@push/shared'
import type { ApplicantSummary, EmployerStage } from '@push/api-client'
import { Link } from 'react-router-dom'

import { APPLICANTS_HEAD, APPLICANT_NEW, memberInitials } from './constants'
import { DOC_BADGE, applicantSub } from './applicant-view'
import { dateLabel } from './posting-view'
import StagePick from './stage-pick'

const ApplicantRow = ({
  postingId,
  applicant,
  busy,
  onMove,
}: {
  postingId: string
  applicant: ApplicantSummary
  busy: boolean
  onMove: (applicant: ApplicantSummary, stage: EmployerStage) => void
}) => {
  const name = applicant.applicant.displayName
  return (
    <li className="biz-row applicant-row">
      <span className="av" style={{ background: brandColor(name) }}>
        {memberInitials(name)}
      </span>
      <Link className="biz-main" to={`/employer/postings/${postingId}/applicants/${applicant.applicationId}`}>
        <span className="badges">
          <strong className="b2 w7">{name}</strong>
          {applicant.isNew ? <span className="badge ac">{APPLICANT_NEW}</span> : null}
        </span>
        <span className="c1 t3">{applicantSub(applicant.applicant)}</span>
      </Link>
      <span className="biz-docs">
        {(applicant.documentKinds ?? []).map((kind) => (
          <span key={kind} className={`badge ${DOC_BADGE[kind].tone}`}>
            {DOC_BADGE[kind].label}
          </span>
        ))}
      </span>
      <span className="b2 t2 num biz-date">
        <span className="biz-label">{APPLICANTS_HEAD[2]}</span>
        {dateLabel(applicant.appliedAt)}
      </span>
      <StagePick name={name} stage={applicant.stage} busy={busy} onPick={(stage) => onMove(applicant, stage)} />
    </li>
  )
}

export default ApplicantRow
