import type { Offer } from '@push/api-client'
import type { OfferBox } from '@push/shared'

export type ThreadFoot = 'respond' | 'declined' | 'closed' | 'composer' | 'none'

/** `sendBlocked`: a send in this visit came back 403 BLOCKED, so the composer closes before canSend re-reads. */
export const threadFoot = (offer: Offer, box: OfferBox, sendBlocked = false): ThreadFoot => {
  if (offer.status === 'DECLINED') return 'declined'
  if (offer.status !== 'ACCEPTED') return box === 'received' ? 'respond' : 'none'
  return (offer.canSend ?? true) && !sendBlocked ? 'composer' : 'closed'
}

export const declineMarked = (offer: Offer, box: OfferBox) => offer.status === 'DECLINED' && box === 'received'
