import type { Offer, OfferMessage } from '@push/api-client'
import { Link } from 'react-router-dom'

import type { useToast } from '../../shared/ui/toast'
import { Icon } from '../../shared/ui/icon'
import { OFFER_ACCEPT, OFFER_ACCEPT_HINT, OFFER_CLOSED_FOOT, OFFER_DECLINE, OFFER_DECLINED_FOOT, OFFER_LIST_BACK, OFFER_PROFILE } from './constants'
import { declineMarked, offerMenuKeys, otherParty, partyLine, threadEntries, threadFoot, type OfferBox } from './lib'
import OfferAvatar from './offer-avatar'
import OfferBubbles from './offer-bubbles'
import OfferComposer from './offer-composer'
import OfferMenu from './offer-menu'
import useOfferActions from './use-offer-actions'

type OfferThreadProps = {
  offer: Offer
  messages: OfferMessage[]
  viewerId: string | undefined
  box: OfferBox
  listPath: string
  show: ReturnType<typeof useToast>['show']
}

const CLOSED_COPY = { declined: OFFER_DECLINED_FOOT, closed: OFFER_CLOSED_FOOT }

const OfferThread = ({ offer, messages, viewerId, box, listPath, show }: OfferThreadProps) => {
  const actions = useOfferActions(offer, box, listPath, show)
  const person = otherParty(offer, box)
  const line = partyLine(person)
  const foot = threadFoot(offer, box)
  return (
    <section className="inbox-thread">
      <div className="thread-head">
        <Link to={listPath} className="hbtn thread-back" aria-label={OFFER_LIST_BACK}>
          <Icon name="back" size={22} width={2.2} />
        </Link>
        <OfferAvatar name={person.displayName} />
        <span className="thread-who">
          <span className="b2 w7">{person.displayName}</span>
          {line ? <span className="c1 t3">{line}</span> : null}
        </span>
        <Link to={`/profiles/${person.id}`} className="chip thread-profile">
          {OFFER_PROFILE}
        </Link>
        <OfferMenu keys={offerMenuKeys(offer, box)} personId={person.id} personName={person.displayName} busy={actions.menu.isPending} onAction={actions.menu.mutate} />
      </div>
      <OfferBubbles offer={offer} entries={threadEntries(offer, messages, viewerId)} declined={declineMarked(offer, box)} />
      {foot === 'composer' ? (
        <div className="thread-foot">
          <OfferComposer sending={actions.send.isPending} onSend={actions.send.mutateAsync} />
        </div>
      ) : null}
      {foot === 'respond' ? (
        <div className="thread-foot thread-respond">
          <span className="c1 t3">{OFFER_ACCEPT_HINT}</span>
          <span className="thread-buttons">
            <button type="button" className="btn sec" disabled={actions.decline.isPending || actions.accept.isPending} onClick={() => actions.decline.mutate()}>
              {OFFER_DECLINE}
            </button>
            <button type="button" className="btn pri" disabled={actions.accept.isPending || actions.decline.isPending} onClick={() => actions.accept.mutate()}>
              {OFFER_ACCEPT}
            </button>
          </span>
        </div>
      ) : null}
      {foot === 'declined' || foot === 'closed' ? <p className="c1 t3 thread-foot thread-closed">{CLOSED_COPY[foot]}</p> : null}
    </section>
  )
}

export default OfferThread
