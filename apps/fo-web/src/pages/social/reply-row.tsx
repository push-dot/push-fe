import type { SocialAuthor } from '@push/api-client'

import AuthorAvatar from './author-avatar'
import { COMMENT_MAX, REPLY_PLACEHOLDER } from './constants'

type ReplyRowProps = {
  viewer: SocialAuthor
  target: string
  text: string
  pending: boolean
  onChange: (text: string) => void
  onCancel: () => void
  onSubmit: () => void
}

const ReplyRow = ({ viewer, target, text, pending, onChange, onCancel, onSubmit }: ReplyRowProps) => (
  <div className="cm reply reply-row">
    <AuthorAvatar author={viewer} size={36} />
    <span className="cm-body">
      <span className="c1 t3 w6">{`${target} 님에게 답글`}</span>
      <label className="reply-box b1">
        <span className="ac w7">{`@${target}`}</span>
        <textarea aria-label="답글" autoFocus rows={1} value={text} maxLength={COMMENT_MAX} placeholder={REPLY_PLACEHOLDER} onChange={(event) => onChange(event.target.value)} />
      </label>
      <span className="reply-actions">
        <button type="button" className="btn sec sm" onClick={onCancel}>
          취소
        </button>
        <button type="button" className="btn pri sm" disabled={text.trim().length < 1 || pending} onClick={onSubmit}>
          답글 달기
        </button>
      </span>
    </span>
  </div>
)

export default ReplyRow
