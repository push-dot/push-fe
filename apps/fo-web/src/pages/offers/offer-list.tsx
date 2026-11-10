import type { Offer } from '@push/api-client'
import { Link, useNavigate } from 'react-router-dom'

import { Icon } from '../../shared/ui/icon'
import StateBlock from '../../shared/ui/state-block'
import {
  OFFER_ARCHIVED_NOTE,
  OFFER_ARCHIVED_TITLE,
  OFFER_EMPTY_ACTION,
  OFFER_EMPTY_ACTION_TO,
  OFFER_EMPTY_ARCHIVED,
  OFFER_EMPTY_RECEIVED,
  OFFER_EMPTY_SENT,
  OFFER_PUBLIC_NOTE,
  OFFER_TAB_RECEIVED,
  OFFER_TAB_SENT,
  OFFER_TITLE,
  OFFERS_PATH,
  offerArchiveRow,
} from './constants'
import OfferRow from './offer-row'

export type OfferView = 'received' | 'sent' | 'archived'

type OfferListProps = {
  view: OfferView
  items: Offer[]
  ready: boolean
  selectedId: string | undefined
  counts: Record<OfferView, number>
}

const EMPTY_COPY: Record<OfferView, string> = { received: OFFER_EMPTY_RECEIVED, sent: OFFER_EMPTY_SENT, archived: OFFER_EMPTY_ARCHIVED }

const TABS: { key: 'received' | 'sent'; label: string }[] = [
  { key: 'received', label: OFFER_TAB_RECEIVED },
  { key: 'sent', label: OFFER_TAB_SENT },
]

const OfferList = ({ view, items, ready, selectedId, counts }: OfferListProps) => {
  const navigate = useNavigate()
  const archived = view === 'archived'
  return (
    <section className="inbox-list">
      {archived ? (
        <>
          <Link to={OFFERS_PATH} className="b2 w6 t3 inbox-back">
            <Icon name="back" size={18} width={2.2} />
            {OFFER_TAB_RECEIVED}
          </Link>
          <h1 className="h2 inbox-title">{OFFER_ARCHIVED_TITLE}</h1>
          <p className="c1 t3 inbox-sub">{OFFER_ARCHIVED_NOTE}</p>
        </>
      ) : (
        <>
          <h1 className="h2 inbox-title">{OFFER_TITLE}</h1>
          <div className="inbox-tabs">
            <div className="seg" role="tablist">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={view === tab.key}
                  onClick={() => navigate(tab.key === 'received' ? OFFERS_PATH : `${OFFERS_PATH}?box=${tab.key}`, { preventScrollReset: true })}
                >
                  {`${tab.label} ${counts[tab.key]}`}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {ready && items.length === 0 ? (
        <div className="inbox-empty">
          <StateBlock
            icon="inbox"
            title={EMPTY_COPY[view]}
            action={
              view === 'received' ? (
                <Link to={OFFER_EMPTY_ACTION_TO} className="btn pri sm">
                  {OFFER_EMPTY_ACTION}
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        items.map((item) => <OfferRow key={item.id} item={item} box={view === 'sent' ? 'sent' : 'received'} archived={archived} selected={item.id === selectedId} />)
      )}
      {view === 'received' && counts.archived > 0 ? (
        <Link to={`${OFFERS_PATH}?box=archived`} className="b2 w6 t2 inbox-archive">
          <span>{offerArchiveRow(counts.archived)}</span>
          <Icon name="next" size={16} width={2.2} className="inbox-chev" />
        </Link>
      ) : null}
      {archived ? null : <p className="c1 t3 inbox-note">{OFFER_PUBLIC_NOTE}</p>}
    </section>
  )
}

export default OfferList
