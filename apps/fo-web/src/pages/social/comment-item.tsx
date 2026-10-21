import type { Comment } from '@push/api-client'
import { authorLabel } from './author-label'
import { EMPLOYER_BADGE } from './constants'

const CommentItem = ({ comment, onReply }: { comment: Comment; onReply: (id: string) => void }) => (
  <li className="comment">
    <span className="post-author">
      <span className="b2 w7">{authorLabel(comment.author)}</span>
      {comment.author.employer ? <span className="badge biz">{EMPLOYER_BADGE}</span> : null}
    </span>
    <p className="b2">{comment.body}</p>
    <button type="button" className="text-link" onClick={() => onReply(comment.id)}>
      답글 달기
    </button>
  </li>
)

export default CommentItem
