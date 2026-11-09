import type { Offer } from '@push/api-client'
import { Link, useNavigate } from 'react-router-dom'

import type { OfferBox } from '../../entities/offer'
import { Icon } from '../../shared/ui/icon'
import StateBlock from '../../shared/ui/state-block'
import {
  OFFER_ARCHIVE_ROW,
  OFFER_ARCHIVED_NOTE,
  OFFER_ARCHIVED_TITLE,
  OFFER_EMPTY_ACTION,
  OFFER_EMPTY_ACTION_TO,
  OFFER_EMPTY_ARCHIVED,
  OFFER_EMPTY_RECEIVED,
  OFFER_EMPTY_SENT,
  OFFER_PUBLIC_NOTE,
  OFFER_RECEIVED_BACK,
  OFFER_TITLE,
  OFFERS_PATH,
} from './constants'
import OfferRow from './offer-row'

type OfferListProps = {
  box: OfferBox
  items: Offer[]
  ready: boolean
  selectedId: string | undefined
  counts: { received: number; sent: number; archived: number }
}

const EMPTY_COPY: Record<OfferBox, string> = { received: OFFER_EMPTY_RECEIVED, sent: OFFER_EMPTY_SENT, archived: OFFER_EMPTY_ARCHIVED }

const OfferList = ({ box, items, ready, selectedId, counts }: OfferListProps) => {
  const navigate = useNavigate()
  const empty = ready && items.length === 0
  const tabs: { key: 'received' | 'sent'; label: string }[] = [
    { key: 'received', label: `받은 제안 ${counts.received}` },
    { key: 'sent', label: `보낸 제안 ${counts.sent}` },
  ]
  return (
    <section className="inbox-list">
      {box === 'archived' ? (
        <>
          <Link to={OFFERS_PATH} className="inbox-back b2 w6 t3">
            <Icon name="back" size={18} width={2.2} />
            {OFFER_RECEIVED_BACK}
          </Link>
          <h1 className="h2 inbox-title">{OFFER_ARCHIVED_TITLE}</h1>
          <p className="c1 t3 inbox-sub">{OFFER_ARCHIVED_NOTE}</p>
        </>
      ) : (
        <>
          <h1 className="h2 inbox-title">{OFFER_TITLE}</h1>
          <div className="inbox-tabs">
            <div className="seg" role="tablist">
              {tabs.map((tab) => (
                <button key={tab.key} type="button" role="tab" aria-selected={box === tab.key} onClick={() => navigate(`${OFFERS_PATH}?box=${tab.key}`)}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {empty ? (
        <div className="inbox-empty">
          <StateBlock
            icon="inbox"
            title={EMPTY_COPY[box]}
            action={
              box === 'received' ? (
                <Link to={OFFER_EMPTY_ACTION_TO} className="btn pri sm">
                  {OFFER_EMPTY_ACTION}
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        items.map((item) => <OfferRow key={item.id} item={item} box={box} selected={item.id === selectedId} />)
      )}
      {box === 'received' && counts.archived > 0 ? (
        <Link to={`${OFFERS_PATH}?box=archived`} className="inbox-archive b2 w6 t2">
          <span>{OFFER_ARCHIVE_ROW(counts.archived)}</span>
          <Icon name="next" size={16} width={2.2} className="deco" />
        </Link>
      ) : null}
      {box === 'archived' ? null : <p className="c1 t3 inbox-note">{OFFER_PUBLIC_NOTE}</p>}
    </section>
  )
}

export default OfferList
