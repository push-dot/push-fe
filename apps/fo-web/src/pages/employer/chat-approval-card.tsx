import { Icon } from '../../shared/ui/icon'
import { brandColor } from '@push/shared'
import type { TurnApproval } from '../../features/employer-chat'
import { useChatActions } from './chat-actions'
import { APPROVAL_NEEDED, APPROVAL_WAITING } from './chat-copy'

const ChatApprovalCard = ({ approval }: { approval: TurnApproval }) => {
  const { busy, picked, answer } = useChatActions()
  const chosen = picked[approval.id]
  return (
    <div className="chat-approval">
      <span className="chat-approval-head">
        <Icon name="guard" size={20} width={2} className="ac" />
        <span className="b2 w7 ac">{APPROVAL_NEEDED}</span>
        {chosen ? null : <span className="badge orange">{APPROVAL_WAITING}</span>}
      </span>
      <span className="h3">{approval.title}</span>
      {approval.rows.length > 0 ? (
        <div className="chat-approval-rows">
          {approval.rows.map((row, index) => (
            <div key={`${row.name}-${index}`} className="chat-approval-row">
              <span
                className="av chat-av"
                style={{ background: row.color ?? brandColor(row.name) }}
              >
                {row.initial}
              </span>
              <span className="b2 w7">{row.name}</span>
              <span className="chat-stage">
                <span className="badge ac">{row.from}</span>
                <Icon name="arrow" size={14} className="t3" />
                <span className="badge orange">{row.to}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {approval.foot ? <span className="c1 t3">{approval.foot}</span> : null}
      <span className="chat-approval-actions">
        {approval.options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={option.id === 'approve' ? 'btn pri sm' : 'btn sec sm'}
            aria-pressed={chosen === option.id}
            disabled={busy || chosen !== undefined}
            onClick={() => answer(approval.id, option.id)}
          >
            {option.label}
          </button>
        ))}
      </span>
    </div>
  )
}

export default ChatApprovalCard
