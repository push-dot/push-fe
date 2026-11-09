import { useSearchParams } from 'react-router-dom'

import { useArchivedOffers, useOffer, useOfferMessages, useOffers } from '../../entities/offer'
import { useSession } from '../../shared/auth/use-session'
import { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import { OFFER_LOAD_ERROR, OFFERS_PATH } from './constants'
import { viewerBox } from './lib'
import OfferList, { type OfferView } from './offer-list'
import OfferPick from './offer-pick'
import OfferThread from './offer-thread'

const viewOf = (box: string | null): OfferView => (box === 'sent' || box === 'archived' ? box : 'received')

const OfferInbox = ({ selectedId }: { selectedId?: string }) => {
  const session = useSession()
  const [params] = useSearchParams()
  const view = viewOf(params.get('box'))
  const toast = useToast()
  const received = useOffers('received')
  const sent = useOffers('sent')
  const archived = useArchivedOffers()
  const offerQuery = useOffer(selectedId)
  const messagesQuery = useOfferMessages(selectedId)
  const lists = { received, sent, archived }
  const count = (key: OfferView) => lists[key].data?.page.total ?? lists[key].data?.data.length ?? 0
  const current = lists[view]
  const items = current.data?.data ?? []
  const single = !selectedId && Boolean(current.data) && items.length === 0
  const listPath = view === 'received' ? OFFERS_PATH : `${OFFERS_PATH}?box=${view}`
  const offer = offerQuery.data
  const viewerId = session?.user.id
  const pane = () => {
    if (!selectedId) return <OfferPick />
    if (offerQuery.isError) {
      return (
        <section className="inbox-pick">
          <ErrorState title={OFFER_LOAD_ERROR} onRetry={() => void offerQuery.refetch()} />
        </section>
      )
    }
    if (!offer) return <section className="inbox-thread" aria-busy="true" />
    return (
      <OfferThread
        key={offer.id}
        offer={offer}
        messages={messagesQuery.data?.data ?? []}
        viewerId={viewerId}
        box={viewerBox(offer, viewerId, view === 'sent' ? 'sent' : 'received')}
        listPath={listPath}
        show={toast.show}
      />
    )
  }
  return (
    <main className="page inbox-page">
      <div className={['inbox', selectedId ? 'is-thread' : 'is-list', single ? 'single' : ''].filter(Boolean).join(' ')}>
        <OfferList view={view} items={items} ready={Boolean(current.data)} selectedId={selectedId} counts={{ received: count('received'), sent: count('sent'), archived: count('archived') }} />
        {single ? null : pane()}
      </div>
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </main>
  )
}

export default OfferInbox
