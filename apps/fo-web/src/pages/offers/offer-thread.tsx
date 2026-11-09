import { Link } from 'react-router-dom'

import type { OfferGap, OfferMessageGap } from '../../entities/offer'
import { Icon } from '../../shared/ui/icon'
import { OFFER_ACCEPT, OFFER_ACCEPT_HINT, OFFER_CLOSED_FOOT, OFFER_DECLINE, OFFER_DECLINED_FOOT, OFFER_LIST_BACK, OFFER_PROFILE } from './constants'
import { partyLine, threadEntries } from './lib'
import OfferAvatar from './offer-avatar'
import OfferBubbles from './offer-bubbles'
import OfferComposer from './offer-composer'
import OfferMenu from './offer-menu'
import type useOfferActions from './use-offer-actions'

type OfferThreadProps = {
  offer: OfferGap
  messages: OfferMessageGap[]
  meId: string | undefined
  listPath: string
  actions: ReturnType<typeof useOfferActions>
}

const OfferThread = ({ offer, messages, meId, listPath, actions }: OfferThreadProps) => {
  const received = offer.sender.id !== meId
  const person = received ? offer.sender : offer.recipient
  const line = partyLine(person)
  const actionable = received && (offer.status === 'SENT' || offer.status === 'READ')
  const closed = offer.status === 'DECLINED' ? OFFER_DECLINED_FOOT : offer.canSend === false ? OFFER_CLOSED_FOOT : null
  return (
    <section className="inbox-thread">
      <div className="inbox-head">
        <Link to={listPath} className="hbtn mback" aria-label={OFFER_LIST_BACK}>
          <Icon name="back" size={22} width={2.2} />
        </Link>
        <OfferAvatar name={person.displayName} />
        <span className="inbox-who">
          <span className="b2 w7">{person.displayName}</span>
          {line ? <span className="c1 t3">{line}</span> : null}
        </span>
        <Link to={`/profiles/${person.id}`} className="chip">
          {OFFER_PROFILE}
        </Link>
        <OfferMenu
          personId={person.id}
          personName={person.displayName}
          archivable={received}
          archived={Boolean(offer.archivedAt)}
          onArchive={() => actions.archive.mutate()}
          onUnarchive={() => actions.unarchive.mutate()}
          onReport={() => actions.report.mutate()}
          onBlock={() => actions.block.mutate({ userId: person.id, name: person.displayName })}
        />
      </div>
      <OfferBubbles offer={offer} entries={threadEntries(offer, messages, meId)} />
      {closed ? (
        <p className="c1 t3 inbox-foot inbox-closed">{closed}</p>
      ) : actionable ? (
        <div className="inbox-foot inbox-actions">
          <span className="c1 t3">{OFFER_ACCEPT_HINT}</span>
          <div className="inbox-buttons">
            <button type="button" className="btn sec" disabled={actions.decline.isPending} onClick={() => actions.decline.mutate()}>
              {OFFER_DECLINE}
            </button>
            <button type="button" className="btn pri" disabled={actions.accept.isPending} onClick={() => actions.accept.mutate()}>
              {OFFER_ACCEPT}
            </button>
          </div>
        </div>
      ) : (
        <div className="inbox-foot">
          <OfferComposer sending={actions.send.isPending} onSend={actions.send.mutateAsync} />
        </div>
      )}
    </section>
  )
}

export default OfferThread
