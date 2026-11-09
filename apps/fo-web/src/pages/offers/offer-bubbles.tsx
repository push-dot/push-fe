import type { Offer } from '@push/api-client'
import { brandColor } from '@push/shared'
import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { clockLabel } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { OFFER_DECLINED, OFFER_MESSAGE_FAILED, OFFER_POSTING } from './constants'
import { dateLabel, dividerLabel, isNewDay, type ThreadEntry } from './lib'

type OfferBubblesProps = { offer: Offer; entries: ThreadEntry[]; declined: boolean }

const OfferBubbles = ({ offer, entries, declined }: OfferBubblesProps) => {
  const body = useRef<HTMLDivElement>(null)
  const now = Date.now()
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight })
  }, [entries.length])
  return (
    <div className="thread-body" ref={body}>
      {offer.posting ? (
        <Link to={`/postings/${offer.posting.id}`} className="offer-posting">
          <span className="offer-posting-logo" style={{ background: brandColor(offer.posting.company) }}>
            {offer.posting.company.slice(0, 1)}
          </span>
          <span className="offer-posting-copy">
            <span className="c2 t3 w6">{OFFER_POSTING}</span>
            <span className="b2 w7 cap">{offer.posting.title}</span>
          </span>
          <Icon name="next" size={18} />
        </Link>
      ) : null}
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {isNewDay(entry.createdAt, entries[index - 1]?.createdAt) ? <span className="c2 t4 thread-day">{dividerLabel(entry.createdAt, now)}</span> : null}
          <div className={entry.mine ? 'bubble mine' : 'bubble'}>
            <p className={entry.failed ? 'b2 failed' : 'b2'}>{entry.body}</p>
            {entry.failed ? (
              <span className="c2 w6 msg-fail">
                <span className="msg-bang" aria-hidden="true">
                  !
                </span>
                {OFFER_MESSAGE_FAILED}
              </span>
            ) : (
              <span className="c2 t4">{clockLabel(entry.createdAt)}</span>
            )}
          </div>
        </Fragment>
      ))}
      {declined ? (
        <span className="c1 t3 thread-mark">{offer.respondedAt ? `${dateLabel(offer.respondedAt)} · ${OFFER_DECLINED}` : OFFER_DECLINED}</span>
      ) : null}
    </div>
  )
}

export default OfferBubbles
