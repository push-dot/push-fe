import type { Message } from '@push/api-client'
import { parsePostingDraft } from '../../shared/model/employer-chat'
import ChatDraftCard from './chat-draft-card'
import { CHAT_ASSISTANT, CHAT_USER } from './constants'

const FENCE = /```posting-draft[ \t]*\r?\n[\s\S]*?```/g

const ChatMessage = ({ message }: { message: Message }) => {
  const draft = parsePostingDraft(message.text)
  const text = message.text.replace(FENCE, '').trim()
  const mine = message.role === 'USER'
  return (
    <li className={mine ? 'chat-msg mine' : 'chat-msg'}>
      <span className="c1 t3">{mine ? CHAT_USER : CHAT_ASSISTANT}</span>
      {text ? <p className="b1">{text}</p> : null}
      {draft ? <ChatDraftCard draft={draft} /> : null}
      {message.attachments.length > 0 ? (
        <span className="c1 t3">{message.attachments.map((item) => item.title || item.id).join(' · ')}</span>
      ) : null}
    </li>
  )
}

export default ChatMessage
