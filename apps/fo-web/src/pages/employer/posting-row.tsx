import type { Posting } from '@push/api-client'
import { Link } from 'react-router-dom'
import { APPLICANTS_LINK, CLOSED_LABEL } from './constants'

const PostingRow = ({ posting }: { posting: Posting }) => {
  const timing = posting.closedAt ? CLOSED_LABEL : posting.deadline
  return (
    <li className="activity-row">
      <Link to={`/employer/postings/${posting.id}/edit`} className="bookmark-row">
        <strong className="b1">{posting.title}</strong>
        <span className="c1 t3">{posting.company}</span>
      </Link>
      {timing ? <span className={posting.closedAt ? 'badge grey' : 'c1 t3'}>{timing}</span> : null}
      <Link className="text-link" to={`/employer/postings/${posting.id}/applicants`}>
        {APPLICANTS_LINK}
      </Link>
    </li>
  )
}

export default PostingRow
