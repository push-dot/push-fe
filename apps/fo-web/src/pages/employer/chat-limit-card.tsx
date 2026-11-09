import { Link } from 'react-router-dom'
import ChatIcon from './chat-icon'
import { CHAT_BUY, CHAT_UPGRADE, LIMIT_ADMIN_ONLY, LIMIT_REFILL, LIMIT_TITLE, LIMIT_TITLE_ULTRA } from './chat-copy'

const PLANS = '/employer/plans'

const Action = ({ label, primary, admin }: { label: string; primary: boolean; admin: boolean }) => {
  const className = primary ? 'btn pri sm' : 'btn sec sm chat-limit-sec'
  return admin ? (
    <Link className={className} to={PLANS}>
      {label}
    </Link>
  ) : (
    <button type="button" className={className} disabled>
      {label}
    </button>
  )
}

const ChatLimitCard = ({ ultra, admin }: { ultra: boolean; admin: boolean }) => (
  <div className="chat-limit" role="status">
    <span className="chat-limit-icon">
      <ChatIcon name="gauge" size={22} />
    </span>
    <span className="chat-limit-copy">
      <span className="b1 w7">{ultra ? LIMIT_TITLE_ULTRA : LIMIT_TITLE}</span>
      <span className="c1 t3">{LIMIT_REFILL}</span>
      <span className="chat-limit-actions">
        {ultra ? null : <Action label={CHAT_UPGRADE} primary admin={admin} />}
        <Action label={CHAT_BUY} primary={ultra} admin={admin} />
      </span>
      {admin ? null : <span className="c1 t3">{LIMIT_ADMIN_ONLY}</span>}
    </span>
  </div>
)

export default ChatLimitCard
