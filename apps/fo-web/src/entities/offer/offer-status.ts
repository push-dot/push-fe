import type { OfferStatus } from '@push/api-client'

export type OfferStatusBox = 'received' | 'sent' | 'archived'

export const offerStatusLabel = (status: OfferStatus, box: OfferStatusBox) => {
  if (box === 'archived') return '보관함'
  if (status === 'SENT') return box === 'received' ? '새 제안' : '읽지 않음'
  if (status === 'READ') return '읽음'
  if (status === 'ACCEPTED') return '수락함'
  return '거절함'
}

export const offerStatusTone = (status: OfferStatus, box: OfferStatusBox) => {
  if (box === 'archived') return 'grey'
  if (status === 'SENT' && box === 'received') return 'ac'
  if (status === 'ACCEPTED') return 'green'
  return 'grey'
}
