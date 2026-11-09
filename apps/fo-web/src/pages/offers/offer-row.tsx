import type { Offer } from '@push/api-client'
import { Link } from 'react-router-dom'

import { offerBadge } from '../../entities/offer'
import { OFFERS_PATH } from './constants'
import { listTime, otherParty, partyLine, type OfferBox } from './lib'
import OfferAvatar from './offer-avatar'

type OfferRowProps = { item: Offer; box: OfferBox; archived: boolean; selected: boolean }

const OfferRow = ({ item, box, archived, selected }: OfferRowProps) => {
  const who = otherParty(item, box)
  const line = partyLine(who)
  const badge = offerBadge(item, box)
  return (
    <Link
      preventScrollReset
      to={`${OFFERS_PATH}/${item.id}?box=${archived ? 'archived' : box}`}
      className={selected ? 'inbox-row on' : 'inbox-row'}
      aria-current={selected ? 'true' : undefined}
    >
      <OfferAvatar name={who.displayName} />
      <span className="inbox-copy">
        <span className="inbox-line">
          <span className="b2 w7 cap">{who.displayName}</span>
          {box === 'received' && item.status === 'SENT' && !archived ? <span className="inbox-dot" aria-hidden="true" /> : null}
          <span className="c2 t3 inbox-time">{listTime(item.createdAt)}</span>
        </span>
        {line ? <span className="c1 t3 cap">{line}</span> : null}
        <span className="c1 t2 cap">{item.message}</span>
        <span className={`badge ${badge.tone}`}>{badge.label}</span>
      </span>
    </Link>
  )
}

export default OfferRow
