import type { TurnChoice } from '../../features/employer-chat'
import { useChatActions } from './chat-actions'
import { CHOICE_FOOT } from './chat-copy'

const ChatChoiceCard = ({ choice }: { choice: TurnChoice }) => {
  const { busy, picked, answer } = useChatActions()
  const chosen = picked[choice.id]
  const lit = chosen ?? choice.recommended ?? choice.options[0]?.id
  return (
    <div className="chat-choice">
      {choice.title ? <span className="h3 chat-choice-title">{choice.title}</span> : null}
      {choice.options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          className={option.id === lit ? 'chat-option on' : 'chat-option'}
          aria-pressed={chosen === option.id}
          disabled={busy || chosen !== undefined}
          onClick={() => answer(choice.id, option.id)}
        >
          <span className="chat-option-n">{index + 1}</span>
          <span className="chat-option-copy">
            <span className="b2 w7">{option.label}</span>
            {option.desc ? <span className="c1 t3">{option.desc}</span> : null}
          </span>
        </button>
      ))}
      <span className="c1 t4 chat-choice-foot">{CHOICE_FOOT}</span>
    </div>
  )
}

export default ChatChoiceCard
