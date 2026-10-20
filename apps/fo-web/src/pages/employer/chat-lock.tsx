import { Link } from 'react-router-dom'
import { PLANS_LINK } from './constants'

const ChatLock = ({ message }: { message: string }) => (
  <section className="stack" role="status">
    <div className="lock-card">
      <p className="b1">{message}</p>
      <Link className="text-link" to="/employer/plans">
        {PLANS_LINK}
      </Link>
    </div>
  </section>
)

export default ChatLock
