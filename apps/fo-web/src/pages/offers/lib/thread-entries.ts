import { ApiError, type Offer, type OfferMessage } from '@push/api-client'

export type ThreadEntry = { id: string; mine: boolean; body: string; createdAt: string; failed: boolean }

// shortcut: OfferMessage has no status yet (push-be sends status FAILED on the mock only); read it here until api-client types it.
const isFailed = (message: OfferMessage) => (message as OfferMessage & { status?: string }).status === 'FAILED'

export const threadEntries = (offer: Offer, messages: OfferMessage[], viewerId: string | undefined): ThreadEntry[] => [
  { id: `offer-${offer.id}`, mine: offer.sender.id === viewerId, body: offer.message, createdAt: offer.createdAt, failed: false },
  ...messages.map((item) => ({ id: item.id, mine: item.sender.id === viewerId, body: item.body, createdAt: item.createdAt, failed: isFailed(item) })),
]

/** A send push-be rejected with 403 BLOCKED (the other person blocked the viewer): it stays as a failed bubble, since a retry can never work. */
export const blockedSend = (error: unknown, body: string, now = new Date()): ThreadEntry | null =>
  error instanceof ApiError && error.code === 'BLOCKED'
    ? { id: `blocked-${now.getTime()}`, mine: true, body, createdAt: now.toISOString(), failed: true }
    : null
