import { stageBadge, type ApplicantSummary } from '@push/api-client'
import { Link } from 'react-router-dom'

const appliedLabel = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split('-')
  if (!year || !month || !day) return iso
  return `${Number(year)}년 ${Number(month)}월 ${Number(day)}일`
}

const ApplicantRow = ({ postingId, applicant }: { postingId: string; applicant: ApplicantSummary }) => (
  <li>
    <Link className="bookmark-row" to={`/employer/postings/${postingId}/applicants/${applicant.applicationId}`}>
      <strong className="b1">{applicant.applicant.displayName}</strong>
      {applicant.applicant.headline ? <span className="b2 t2">{applicant.applicant.headline}</span> : null}
      <span className="badge grey">{stageBadge(applicant.stage)}</span>
      <span className="c1 t3">{appliedLabel(applicant.appliedAt)}</span>
    </Link>
  </li>
)

export default ApplicantRow
