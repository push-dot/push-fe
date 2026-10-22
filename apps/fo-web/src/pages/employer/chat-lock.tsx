import { Link } from 'react-router-dom'
import { PLANS_LINK } from './constants'

const ChatLock = ({ message }: { message: string }) => (
  <section className="lock-card" role="status">
    <h2 className="h3">{message}</h2>
    <Link className="btn pri" to="/employer/plans">
      {PLANS_LINK}
    </Link>
  </section>
)

export default ChatLock
