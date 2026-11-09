import { Link } from 'react-router-dom'
import { usePaymentsOpen } from '../../entities/billing'
import { Icon } from '../../shared/ui/icon'
import { useChatActions } from './chat-actions'
import { lockBody, LOCK_ADMIN_ONLY, LOCK_REVIEW_ONLY, LOCK_TITLE, REVIEW_ASK } from './chat-copy'
import { PLANS_LINK } from './constants'

/** 403 PLAN_REQUIRED (Pro) for an interview ask below Pro. */
const ChatLock = ({ plan }: { plan: string | null }) => {
  const { busy, send } = useChatActions()
  const payable = usePaymentsOpen()
  return (
    <section className="chat-lock" role="status">
      <span className="chat-lock-icon">
        <Icon name="lock" size={26} />
      </span>
      <span className="chat-lock-copy">
        <span className="h3">{LOCK_TITLE}</span>
        <span className="b2 t2">{lockBody(plan)}</span>
        <span className="chat-lock-actions">
          {payable ? (
            <Link className="btn pri sm" to="/employer/plans">
              {PLANS_LINK}
            </Link>
          ) : null}
          <button
            type="button"
            className="btn sec sm"
            disabled={busy}
            onClick={() => send(REVIEW_ASK, 'review')}
          >
            {LOCK_REVIEW_ONLY}
          </button>
        </span>
        <span className="c1 t3">{LOCK_ADMIN_ONLY}</span>
      </span>
    </section>
  )
}

export default ChatLock
