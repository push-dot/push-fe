import type { TurnApproval } from '../../features/employer-chat'

type ChatApprovalCardProps = {
  approval: TurnApproval
  picked?: string
  busy: boolean
  onPick: (optionId: string) => void
}

const ChatApprovalCard = ({ approval, picked, busy, onPick }: ChatApprovalCardProps) => (
  <li className="chat-msg">
    <div className="draft-card">
      <strong className="b1">{approval.title}</strong>
      <div className="chat-approval-actions">
        {approval.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            className={index === 0 ? 'btn pri sm' : 'btn sec sm'}
            aria-pressed={picked === option.id}
            disabled={busy || picked !== undefined}
            onClick={() => onPick(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  </li>
)

export default ChatApprovalCard
