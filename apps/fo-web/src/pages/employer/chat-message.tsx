import type { Message } from '@push/api-client'
import { parsePostingDraft } from '../../shared/model/employer-chat'
import ChatDraftCard from './chat-draft-card'
import { CHAT_ASSISTANT, CHAT_USER } from './constants'

const FENCE = /```posting-draft[ \t]*\r?\n[\s\S]*?```/g

const ChatMessage = ({ message }: { message: Message }) => {
  const draft = parsePostingDraft(message.text)
  const text = message.text.replace(FENCE, '').trim()
  return (
    <li className="activity-row">
      <span className="c1 t3">{message.role === 'USER' ? CHAT_USER : CHAT_ASSISTANT}</span>
      {text ? <p className="b1 post-body">{text}</p> : null}
      {draft ? <ChatDraftCard draft={draft} /> : null}
    </li>
  )
}

export default ChatMessage
