import { useState, type KeyboardEvent } from 'react'
import type { TurnChoice } from '../../features/employer-chat'
import { useChatActions } from './chat-actions'
import { stepOption } from './chat-choice-keys'
import { CHOICE_FOOT } from './chat-copy'

const ChatChoiceCard = ({ choice }: { choice: TurnChoice }) => {
  const { busy, picked, answer } = useChatActions()
  const chosen = picked[choice.id]
  const [cursor, setCursor] = useState<string | null>(null)
  const lit = chosen ?? cursor ?? choice.recommended ?? choice.options[0]?.id
  // ↑↓ move the highlight (and focus) between options; Enter presses the focused one.
  const move = (event: KeyboardEvent<HTMLDivElement>) => {
    if (chosen !== undefined) return
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button.chat-option')]
    const at = buttons.findIndex((button) => button === document.activeElement)
    const next = stepOption(event.key, at < 0 ? choice.options.findIndex((item) => item.id === lit) : at, buttons.length)
    if (next === null) return
    event.preventDefault()
    buttons[next]?.focus()
    setCursor(choice.options[next]?.id ?? null)
  }
  return (
    <div className="chat-choice" onKeyDown={move}>
      {choice.title ? <span className="h3 chat-choice-title">{choice.title}</span> : null}
      {choice.options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          className={option.id === lit ? 'chat-option on' : 'chat-option'}
          aria-pressed={chosen === option.id}
          disabled={busy || chosen !== undefined}
          onFocus={() => setCursor(option.id)}
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
