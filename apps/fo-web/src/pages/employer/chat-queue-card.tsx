import { Icon } from '../../shared/ui/icon'
import { QUEUE_BODY, QUEUE_TITLE, queueAhead } from './chat-copy'

const ChatQueueCard = ({ ahead }: { ahead: number }) => (
  <div className="chat-queue" role="status">
    <Icon name="clock" size={22} width={2} className="t3" />
    <span className="chat-queue-copy">
      <span className="b2 w7">{QUEUE_TITLE}</span>
      <span className="b2 t2">{QUEUE_BODY}</span>
      {ahead > 0 ? (
        <span className="chat-queue-line">
          <span className="chat-queue-bar" aria-hidden="true">
            <i />
          </span>
          <span className="c1 t3">{queueAhead(ahead)}</span>
        </span>
      ) : null}
    </span>
  </div>
)

export default ChatQueueCard
