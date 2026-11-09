import { brandColor } from '@push/shared'
import { Fragment, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import type { OfferGap } from '../../entities/offer'
import { clockLabel } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { OFFER_DECLINED_MARK, OFFER_MESSAGE_FAILED, OFFER_POSTING } from './constants'
import { dateLabel, dividerLabel, isNewDay, type ThreadEntry } from './lib'

type OfferBubblesProps = { offer: OfferGap; entries: ThreadEntry[] }

const OfferBubbles = ({ offer, entries }: OfferBubblesProps) => {
  const body = useRef<HTMLDivElement>(null)
  const now = Date.now()
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight })
  }, [entries.length])
  return (
    <div className="inbox-body" ref={body}>
      {offer.posting ? (
        <Link to={`/postings/${offer.posting.id}`} className="inbox-posting">
          <span className="av" style={{ background: brandColor(offer.posting.company) }}>
            {offer.posting.company.slice(0, 1)}
          </span>
          <span className="inbox-copy">
            <span className="c2 t3 w6">{OFFER_POSTING}</span>
            <span className="b2 w7 cap">{offer.posting.title}</span>
          </span>
          <Icon name="next" size={18} />
        </Link>
      ) : null}
      {entries.map((entry, index) => (
        <Fragment key={entry.id}>
          {isNewDay(entry.createdAt, entries[index - 1]?.createdAt) ? <span className="c2 t4 inbox-day">{dividerLabel(entry.createdAt, now)}</span> : null}
          <div className={entry.mine ? 'msg mine' : 'msg'}>
            <span className={entry.failed ? 'b2 msg-text failed' : 'b2 msg-text'}>{entry.body}</span>
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
      {offer.status === 'DECLINED' ? (
        <span className="c1 t3 inbox-mark">{offer.declinedAt ? `${dateLabel(offer.declinedAt)} · ${OFFER_DECLINED_MARK}` : OFFER_DECLINED_MARK}</span>
      ) : null}
    </div>
  )
}

export default OfferBubbles
