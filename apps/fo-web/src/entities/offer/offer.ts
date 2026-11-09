import type { Offer, OfferMessage } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'

import { meOffer as fetchOffer, meOfferMessages as fetchOfferMessages, meOffers as fetchOffers } from '../../shared/api/operations'

export type OfferBox = 'received' | 'sent' | 'archived'

export type OfferGap = Offer & { canSend?: boolean; declinedAt?: string | null }
export type OfferMessageGap = OfferMessage & { status?: 'SENT' | 'FAILED' }

export const meOffers = (...args: Parameters<typeof fetchOffers>) => fetchOffers(...args)
export const meOffer = (...args: Parameters<typeof fetchOffer>) => fetchOffer(...args)
export const meOfferMessages = (...args: Parameters<typeof fetchOfferMessages>) => fetchOfferMessages(...args)

export const useOffers = (box: OfferBox, enabled = true) =>
  useQuery({ queryKey: ['offers', box], queryFn: () => meOffers(box as Parameters<typeof fetchOffers>[0]), enabled })

export const useOffer = (id: string | undefined) =>
  useQuery<OfferGap>({ queryKey: ['offer', id], queryFn: () => meOffer(id ?? ''), enabled: Boolean(id) })

export const useOfferMessages = (id: string | undefined) =>
  useQuery({
    queryKey: ['offer-messages', id],
    queryFn: () => meOfferMessages(id ?? ''),
    enabled: Boolean(id),
  })
