import type { Offer } from '@push/api-client'
import { Link } from 'react-router-dom'

import { offerStatusLabel, offerStatusTone, type OfferBox } from '../../entities/offer'
import { listTime, partyLine } from './lib'
import { OFFERS_PATH } from './constants'
import OfferAvatar from './offer-avatar'

type OfferRowProps = { item: Offer; box: OfferBox; selected: boolean }

const OfferRow = ({ item, box, selected }: OfferRowProps) => {
  const who = box === 'sent' ? item.recipient : item.sender
  const line = partyLine(who)
  return (
    <Link to={`${OFFERS_PATH}/${item.id}?box=${box}`} className={selected ? 'inbox-row on' : 'inbox-row'} aria-current={selected ? 'true' : undefined}>
      <OfferAvatar name={who.displayName} />
      <span className="inbox-copy">
        <span className="inbox-line">
          <span className="b2 w7">{who.displayName}</span>
          {box === 'received' && item.status === 'SENT' ? <span className="inbox-dot" aria-hidden="true" /> : null}
          <span className="c2 t3">{listTime(item.createdAt)}</span>
        </span>
        {line ? <span className="c1 t3 cap">{line}</span> : null}
        <span className="c1 t2 cap">{item.message}</span>
        <span className={`badge ${offerStatusTone(item.status, box)}`}>{offerStatusLabel(item.status, box)}</span>
      </span>
    </Link>
  )
}

export default OfferRow
