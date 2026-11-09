import type { Comment } from '@push/api-client'
import { authorLabel } from '../../entities/post'
import { Icon } from '../../shared/ui/icon'
import { EMPLOYER_BADGE } from './constants'

const CommentItem = ({ comment, onReply }: { comment: Comment; onReply: (id: string) => void }) => (
  <li className="comment">
    <span className="post-author">
      <span className="b2 w7">{authorLabel(comment.author)}</span>
      {comment.author.employer ? (
        <span className="badge biz">
          <Icon name="company" size={12} width={2.2} />
          {EMPLOYER_BADGE}
        </span>
      ) : null}
    </span>
    <p className="b2">{comment.body}</p>
    <button type="button" className="text-link" onClick={() => onReply(comment.id)}>
      답글 달기
    </button>
  </li>
)

export default CommentItem
