import { AgentMark, Icon } from '../../shared/ui/icon'
import {
  quoted,
  reviewExample,
  STARTER_BODY,
  STARTER_CARDS,
  STARTER_TITLE,
  type StarterCard,
} from './chat-copy'

/** Empty conversation: hero and four example asks. A card fills the composer; nothing is sent until the user sends it. */
const ChatStarter = ({
  applicant,
  onPick,
}: {
  applicant?: string
  onPick: (card: StarterCard) => void
}) => (
  <div className="chat-start">
    <div className="chat-hero">
      <AgentMark size={48} />
      <h2 className="h2">{STARTER_TITLE}</h2>
      <p className="b2 t3">{STARTER_BODY}</p>
    </div>
    <div className="chat-start-grid">
      {STARTER_CARDS.map((each) => {
        const card =
          each.intent === 'review' ? { ...each, example: reviewExample(applicant) } : each
        return (
          <button
            key={card.intent}
            type="button"
            className="box chat-start-card"
            onClick={() => onPick(card)}
          >
            <span className="chat-start-icon">
              <Icon name={card.icon} size={20} />
            </span>
            <span className="chat-start-copy">
              <span className="b2 w7">{card.title}</span>
              <span className="c1 t3">{quoted(card.example)}</span>
            </span>
          </button>
        )
      })}
    </div>
  </div>
)

export default ChatStarter
