import { useParams } from 'react-router-dom'
import ChatRoom from './chat-room'

const ChatThreadPage = () => {
  const { id = '' } = useParams()
  return <ChatRoom key={id} id={id} screen="thread" />
}

export default ChatThreadPage
