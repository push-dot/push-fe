import { Link } from 'react-router-dom'
import type { PostingDraft } from '../../shared/model/employer-chat'
import { DRAFT_POSTING } from './constants'

const ChatDraftCard = ({ draft }: { draft: PostingDraft }) => (
  <div className="lock-card">
    <Link className="pill" to="/employer/postings/new" state={draft}>
      {DRAFT_POSTING}
    </Link>
  </div>
)

export default ChatDraftCard
