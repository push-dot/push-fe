import type { Conversation } from '@push/api-client'
import { Link } from 'react-router-dom'

const ChatRow = ({ conversation }: { conversation: Conversation }) => (
  <li>
    <Link className="bookmark-row" to={`/employer/chat/${conversation.id}`}>
      <strong className="b1">{conversation.title}</strong>
    </Link>
  </li>
)

export default ChatRow
