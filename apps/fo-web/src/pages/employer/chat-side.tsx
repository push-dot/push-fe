import type { ConversationListItem, ConversationStatus } from '@push/api-client'
import { Link } from 'react-router-dom'
import { relativeTime } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { CHAT_BUY, queueAhead, usedText } from './chat-copy'
import type { ChatUsage } from './chat-usage'
import { CHAT_EMPTY, CHAT_FAILED, CHAT_LOADING, CHAT_NEW, CHAT_SHARED } from './constants'

/** Board marks: a running job is accent, a pending approval is orange, a finished chat has none. */
export const chatListMark = (
  status: ConversationStatus,
): { label: string; tone: 'ac' | 'orange' } | null =>
  status === 'RUNNING'
    ? { label: '작업 중', tone: 'ac' }
    : status === 'NEEDS_APPROVAL'
      ? { label: '확인 필요', tone: 'orange' }
      : null

export const UsageMeter = ({ usage, className }: { usage: ChatUsage; className: string }) => (
  <span className={usage.full ? `${className} full` : className} aria-hidden="true">
    <i style={{ width: `${usage.percent}%` }} />
  </span>
)

const ChatSide = ({
  conversations,
  activeId,
  loading,
  failed,
  usage,
}: {
  conversations: ConversationListItem[]
  activeId?: string
  loading: boolean
  failed: boolean
  usage: ChatUsage | null
}) => (
  <aside className="chat-side">
    <Link className="btn pri chat-new" to="/employer/chat/new">
      <Icon name="plus" size={18} width={2.4} />
      {CHAT_NEW}
    </Link>
    <p className="c1 w7 t3 chat-shared">{CHAT_SHARED}</p>
    {failed ? (
      <p className="b2 chat-side-note" role="alert">
        {CHAT_FAILED}
      </p>
    ) : null}
    {loading ? <p className="c1 t3 chat-side-note">{CHAT_LOADING}</p> : null}
    {!loading && !failed && conversations.length === 0 ? (
      <p className="c1 t3 chat-side-note">{CHAT_EMPTY}</p>
    ) : null}
    <nav className="chat-rooms">
      {conversations.map((conversation) => {
        const mark = chatListMark(conversation.status)
        const author = conversation.createdBy.displayName
        const queued = conversation.queuePosition !== null && conversation.queuePosition > 0 ? queueAhead(conversation.queuePosition) : ''
        const meta = [author, queued].filter(Boolean).join(' · ')
        return (
          <Link
            key={conversation.id}
            className={conversation.id === activeId ? 'chat-link on' : 'chat-link'}
            aria-current={conversation.id === activeId ? 'page' : undefined}
            to={`/employer/chat/${conversation.id}`}
          >
            <span className="chat-link-title">
              <span className="b2 w7 cap">{conversation.title || CHAT_NEW}</span>
              {mark ? <span className={`badge ${mark.tone}`}>{mark.label}</span> : null}
              <span className="c1 t3">{relativeTime(conversation.updatedAt)}</span>
            </span>
            {meta ? <span className="c1 t3 cap">{meta}</span> : null}
            {conversation.lastLine ? (
              <span className="c1 t3 cap">{conversation.lastLine}</span>
            ) : null}
          </Link>
        )
      })}
    </nav>
    {usage ? (
      <div className="chat-usage">
        <span className="c1 chat-usage-line">
          <span className="w7">{usage.plan}</span>
          <span className="t3">{usedText(usage.percent)}</span>
        </span>
        <UsageMeter usage={usage} className="chat-meter" />
        {usage.topup ? (
          <Link className="c1 w7" to="/employer/plans">
            {CHAT_BUY}
          </Link>
        ) : null}
      </div>
    ) : null}
  </aside>
)

export default ChatSide
