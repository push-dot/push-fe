import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { offerStatusLabel } from './offer-status'

const OffersPage = () => {
  const [params, setParams] = useSearchParams()
  const box = params.get('box') === 'sent' ? 'sent' : 'received'
  const received = useQuery({ queryKey: ['offers', 'received'], queryFn: () => api.me.offers('received') })
  const sent = useQuery({ queryKey: ['offers', 'sent'], queryFn: () => api.me.offers('sent') })
  const items = (box === 'sent' ? sent.data?.data : received.data?.data) ?? []
  const empty = box === 'sent' ? '보낸 제안이 없어요.' : '받은 제안이 없어요.'
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">제안함</h1>
      </header>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={box === 'received'} onClick={() => setParams({ box: 'received' })}>
          {`받은 제안 ${received.data?.data.length ?? 0}`}
        </button>
        <button type="button" role="tab" aria-selected={box === 'sent'} onClick={() => setParams({ box: 'sent' })}>
          {`보낸 제안 ${sent.data?.data.length ?? 0}`}
        </button>
      </div>
      {items.length === 0 && (box === 'sent' ? sent.data : received.data) ? <p className="b2 t3 empty-copy">{empty}</p> : null}
      <ul className="activity-list">
        {items.map((offer) => (
          <li key={offer.id}>
            <Link to={`/offers/${offer.id}`} className="offer-row">
              <span className="offer-line">
                <span className="b2 w7">{box === 'received' ? offer.sender.displayName : offer.recipient.displayName}</span>
                <span className="badge grey">{offerStatusLabel(offer.status, box)}</span>
              </span>
              <p className="b2 t2 post-excerpt">{offer.message}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default OffersPage
