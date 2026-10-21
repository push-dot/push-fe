import { EMPLOYMENT_TYPES, type Posting } from '@push/api-client'
import { Link } from 'react-router-dom'
import { careerLabel } from '../../format'
import { APPLICANTS_LINK, DEADLINE_OPEN, STATUS_CLOSED, STATUS_OPEN } from './constants'

const deadlineLabel = (iso: string | null) => {
  if (!iso) return DEADLINE_OPEN
  const [, month, day] = iso.slice(0, 10).split('-').map(Number)
  if (!month || !day) return iso
  return `${month}월 ${day}일`
}

const PostingRow = ({ posting }: { posting: Posting }) => {
  const employment = EMPLOYMENT_TYPES.find((item) => item.key === posting.employmentType)?.label
  const closed = Boolean(posting.closedAt)
  return (
    <tr>
      <td>
        <Link to={`/employer/postings/${posting.id}/edit`}>
          <strong className="b1">{posting.title}</strong>
          <span className="c1 t3">{[careerLabel(posting.careerMin, posting.careerMax), employment].filter(Boolean).join(' · ')}</span>
        </Link>
      </td>
      <td>
        <span className={closed ? 'badge grey' : 'badge green'}>{closed ? STATUS_CLOSED : STATUS_OPEN}</span>
      </td>
      <td>
        <Link className="text-link" to={`/employer/postings/${posting.id}/applicants`}>
          {APPLICANTS_LINK}
        </Link>
      </td>
      <td className="num">{closed && !posting.deadline ? '–' : deadlineLabel(posting.deadline)}</td>
    </tr>
  )
}

export default PostingRow
