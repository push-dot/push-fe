import type { TurnPlan } from '../../features/employer-chat'

const TONE: Record<string, string> = { '확인 필요': 'orange', '근거 충분': 'green' }

const ChatPlanCard = ({ plan }: { plan: TurnPlan }) => (
  <div className="chat-evidence">
    {plan.rows.map((row) => (
      <div key={row.label} className="chat-evidence-row">
        <span className={`badge ${TONE[row.tag] ?? 'grey'}`}>{row.tag}</span>
        <span className="chat-evidence-copy">
          <span className="b2 w7">{row.label}</span>
          <span className="b2 t2">{row.note}</span>
        </span>
      </div>
    ))}
  </div>
)

export default ChatPlanCard
