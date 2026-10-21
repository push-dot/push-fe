import type { ApplicantSummary } from '@push/api-client'
import { Link } from 'react-router-dom'
import { employerStageLabel } from '../../entities/application'

const appliedLabel = (iso: string) => {
  const [, month, day] = iso.slice(0, 10).split('-')
  if (!month || !day) return iso
  return `${Number(month)}월 ${Number(day)}일`
}

const stageClass = (label: string) => {
  if (label === '서류 통과' || label === '합격') return 'badge green'
  if (label === '면접') return 'badge ac'
  if (label === '불합격') return 'badge grey'
  return 'badge grey'
}

const ApplicantRow = ({ postingId, applicant }: { postingId: string; applicant: ApplicantSummary }) => {
  const label = employerStageLabel(applicant.stage)
  return (
    <tr>
      <td>
        <Link to={`/employer/postings/${postingId}/applicants/${applicant.applicationId}`}>
          <strong className="b1">{applicant.applicant.displayName}</strong>
          {applicant.applicant.headline ? <span className="c1 t3">{applicant.applicant.headline}</span> : null}
        </Link>
      </td>
      <td className="num">{appliedLabel(applicant.appliedAt)}</td>
      <td>
        <span className={stageClass(label)}>{label}</span>
      </td>
    </tr>
  )
}

export default ApplicantRow
