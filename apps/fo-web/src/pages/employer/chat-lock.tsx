import { Link } from 'react-router-dom'
import { usePaymentsOpen } from '../../entities/billing'
import { PLANS_LINK } from './constants'

const ChatLock = ({ message }: { message: string }) => {
  const payable = usePaymentsOpen()
  return (
    <section className="lock-card" role="status">
      <h2 className="h3">{message}</h2>
      {payable ? (
        <Link className="btn pri" to="/employer/plans">
          {PLANS_LINK}
        </Link>
      ) : null}
    </section>
  )
}

export default ChatLock
