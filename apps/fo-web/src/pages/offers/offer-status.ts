import type { OfferStatus } from '@push/api-client'

export const offerStatusLabel = (status: OfferStatus, box: 'received' | 'sent') => {
  if (status === 'SENT') return box === 'received' ? '새 제안' : '읽지 않음'
  if (status === 'READ') return '읽음'
  if (status === 'ACCEPTED') return '수락함'
  return '거절함'
}
