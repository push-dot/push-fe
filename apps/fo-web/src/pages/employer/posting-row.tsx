import { EMPLOYMENT_TYPES, type Posting } from '@push/api-client'
import { careerLabel } from '@push/shared'
import { Link } from 'react-router-dom'
import { APPLICANTS_LINK, DEADLINE_OPEN, STATUS_CLOSED, STATUS_OPEN } from './constants'

const deadlineLabel = (iso: string | null) => {
  if (!iso) return DEADLINE_OPEN
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!month || !day) return iso
  return `${month}월 ${day}일`
}

const PostingRow = ({ posting }: { posting: Posting }) => {
  const career = careerLabel(posting)
  const employment = EMPLOYMENT_TYPES.find((item) => item.key === posting.employmentType)?.label
  const closed = Boolean(posting.closedAt)
  return (
    <li className="jobs-row">
      <Link className="jobs-who" to={`/employer/postings/${posting.id}/edit`}>
        <strong className="b1 cap">{posting.title}</strong>
        <span className="c1 t3">{[career === '신입' ? career : `경력 ${career}`, employment].filter(Boolean).join(' · ')}</span>
      </Link>
      <span className={closed ? 'badge grey' : 'badge green'}>{closed ? STATUS_CLOSED : STATUS_OPEN}</span>
      <Link className="b2 w7 ac posting-link" to={`/employer/postings/${posting.id}/applicants`}>
        {APPLICANTS_LINK}
      </Link>
      <span className="b2 t2 num">
        <span className="jobs-label">{STATUS_CLOSED}</span>
        {closed && !posting.deadline ? '–' : deadlineLabel(posting.deadline)}
      </span>
    </li>
  )
}

export default PostingRow
