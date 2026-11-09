import type { OfferGap, OfferMessageGap } from '../../../entities/offer'

export type ThreadEntry = { id: string; mine: boolean; body: string; createdAt: string; failed: boolean }

export const threadEntries = (offer: OfferGap, messages: OfferMessageGap[], meId: string | undefined): ThreadEntry[] => [
  { id: `offer-${offer.id}`, mine: offer.sender.id === meId, body: offer.message, createdAt: offer.createdAt, failed: false },
  ...messages.map((item) => ({ id: item.id, mine: item.sender.id === meId, body: item.body, createdAt: item.createdAt, failed: item.status === 'FAILED' })),
]
