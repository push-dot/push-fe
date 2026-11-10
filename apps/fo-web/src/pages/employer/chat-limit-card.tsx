import { Link } from 'react-router-dom'
import { Icon } from '../../shared/ui/icon'
import {
  CHAT_BUY,
  CHAT_UPGRADE,
  LIMIT_ADMIN_ONLY,
  LIMIT_REFILL,
  LIMIT_TITLE,
  LIMIT_TITLE_ULTRA,
} from './chat-copy'
import { CHAT_CREDITS_CLOSED } from './constants'

const Action = ({ label, primary, admin }: { label: string; primary: boolean; admin: boolean }) => {
  const className = primary ? 'btn pri sm' : 'btn sec sm chat-limit-sec'
  return admin ? (
    <Link className={className} to="/employer/plans">
      {label}
    </Link>
  ) : (
    <button type="button" className={className} disabled>
      {label}
    </button>
  )
}

/** 402 INSUFFICIENT_CREDITS in place of the composer. While payments are closed it states the fact and offers nothing to buy. */
const ChatLimitCard = ({
  ultra,
  admin,
  payable,
}: {
  ultra: boolean
  admin: boolean
  payable: boolean
}) => (
  <div className="chat-limit" role="status">
    <span className="chat-limit-icon">
      <Icon name="gauge" size={22} />
    </span>
    <span className="chat-limit-copy">
      <span className="b1 w7">
        {payable ? (ultra ? LIMIT_TITLE_ULTRA : LIMIT_TITLE) : CHAT_CREDITS_CLOSED}
      </span>
      <span className="c1 t3">{LIMIT_REFILL}</span>
      {payable ? (
        <span className="chat-limit-actions">
          {ultra ? null : <Action label={CHAT_UPGRADE} primary admin={admin} />}
          <Action label={CHAT_BUY} primary={ultra} admin={admin} />
        </span>
      ) : null}
      {payable && !admin ? <span className="c1 t3">{LIMIT_ADMIN_ONLY}</span> : null}
    </span>
  </div>
)

export default ChatLimitCard
