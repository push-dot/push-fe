import type { Comment } from '@push/api-client'

import { authorLabel } from '../../entities/post'
import { relativeTime } from '../../shared/lib/format'
import AuthorAvatar from './author-avatar'
import EmployerBadge from './employer-badge'

const CommentItem = ({ comment, reply = false, active = false, onReply }: { comment: Comment; reply?: boolean; active?: boolean; onReply: () => void }) => (
  <div className={reply ? 'cm reply' : 'cm'}>
    <AuthorAvatar author={comment.author} size={36} />
    <span className="cm-body">
      <span className="b2 w7 cm-name">
        {authorLabel(comment.author)}
        {comment.author.employer ? <EmployerBadge /> : null}
        <span className="c1 t3 w6">{relativeTime(comment.createdAt)}</span>
      </span>
      <span className="b2 t2 cm-text">{comment.body}</span>
      <button type="button" className={active ? 'cm-reply c1 ac w7' : 'cm-reply c1 t3 w6'} onClick={onReply}>
        답글 달기
      </button>
    </span>
  </div>
)

export default CommentItem
