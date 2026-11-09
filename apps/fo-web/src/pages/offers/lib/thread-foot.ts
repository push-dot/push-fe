import type { Offer } from '@push/api-client'
import type { OfferBox } from '@push/shared'

export type ThreadFoot = 'respond' | 'declined' | 'closed' | 'composer' | 'none'

export const threadFoot = (offer: Offer, box: OfferBox): ThreadFoot => {
  if (offer.status === 'DECLINED') return 'declined'
  if (offer.status !== 'ACCEPTED') return box === 'received' ? 'respond' : 'none'
  return (offer.canSend ?? true) ? 'composer' : 'closed'
}

export const declineMarked = (offer: Offer, box: OfferBox) => offer.status === 'DECLINED' && box === 'received'
