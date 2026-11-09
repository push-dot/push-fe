import type { Offer, OfferMessage } from '@push/api-client'

export type ThreadEntry = { id: string; mine: boolean; body: string; createdAt: string; failed: boolean }

// shortcut: OfferMessage has no status yet (push-be sends status FAILED on the mock only); read it here until api-client types it.
const isFailed = (message: OfferMessage) => (message as OfferMessage & { status?: string }).status === 'FAILED'

export const threadEntries = (offer: Offer, messages: OfferMessage[], viewerId: string | undefined): ThreadEntry[] => [
  { id: `offer-${offer.id}`, mine: offer.sender.id === viewerId, body: offer.message, createdAt: offer.createdAt, failed: false },
  ...messages.map((item) => ({ id: item.id, mine: item.sender.id === viewerId, body: item.body, createdAt: item.createdAt, failed: isFailed(item) })),
]
