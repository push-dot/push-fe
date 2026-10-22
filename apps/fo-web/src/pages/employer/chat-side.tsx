import type { Conversation } from '@push/api-client'
import { Link } from 'react-router-dom'
import { relativeTime } from '../../shared/lib/format'
import { CHAT_EMPTY, CHAT_FAILED, CHAT_LOADING, CHAT_NEW, CHAT_SHARED, CHAT_TOPUP } from './constants'

export type ChatUsage = { plan: string; remain: string; allowance: string; ratio: number }

const ChatSide = ({
  conversations,
  activeId,
  loading,
  failed,
  usage,
}: {
  conversations: Conversation[]
  activeId?: string
  loading: boolean
  failed: boolean
  usage: ChatUsage | null
}) => (
  <aside className="chat-side">
    <Link className="btn pri" to="/employer/chat/new">
      {CHAT_NEW}
    </Link>
    <p className="c1 w7 t3 chat-shared">{CHAT_SHARED}</p>
    {failed ? (
      <p className="b2" role="alert">
        {CHAT_FAILED}
      </p>
    ) : null}
    {loading ? <p className="c1 t3">{CHAT_LOADING}</p> : null}
    {!loading && conversations.length === 0 ? <p className="c1 t3">{CHAT_EMPTY}</p> : null}
    <nav>
      {conversations.map((conversation) => (
        <Link key={conversation.id} className={conversation.id === activeId ? 'chat-link on' : 'chat-link'} to={`/employer/chat/${conversation.id}`}>
          <span className="b2 w7 cap">{conversation.title || '기업 AI'}</span>
          <span className="c1 t3">{relativeTime(conversation.updatedAt)}</span>
        </Link>
      ))}
    </nav>
    {usage ? (
      <div className="chat-usage">
        <span className="c1 chat-usage-line">
          <span className="w7">{usage.plan}</span>
          <span className="t3 num">{usage.allowance ? `${usage.remain} / ${usage.allowance}` : usage.remain}</span>
        </span>
        <span className="chat-meter" aria-hidden="true">
          <span style={{ width: `${usage.ratio}%` }} />
        </span>
        <Link className="c1 w7" to="/employer/plans">
          {CHAT_TOPUP}
        </Link>
      </div>
    ) : null}
  </aside>
)

export default ChatSide
