import type { Offer } from '@push/api-client'

export type OfferBadgeTone = 'ac' | 'green' | 'grey'

export const OFFER_ARCHIVED_LABEL = '보관함'

export const offerBadge = (offer: Pick<Offer, 'status' | 'archivedAt'>, box: 'received' | 'sent'): { label: string; tone: OfferBadgeTone } => {
  if (offer.archivedAt) return { label: OFFER_ARCHIVED_LABEL, tone: 'grey' }
  if (offer.status === 'ACCEPTED') return { label: '수락함', tone: 'green' }
  if (offer.status === 'DECLINED') return { label: '거절함', tone: 'grey' }
  if (box === 'received') return { label: '새 제안', tone: 'ac' }
  return { label: offer.status === 'READ' ? '읽음' : '읽지 않음', tone: 'grey' }
}
