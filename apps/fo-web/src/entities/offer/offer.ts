import { useQuery } from '@tanstack/react-query'
import { meOffer as fetchOffer, meOfferMessages as fetchOfferMessages, meOffers as fetchOffers } from '../../shared/api/operations'

export const meOffers = (...args: Parameters<typeof fetchOffers>) => fetchOffers(...args)
export const meOffer = (...args: Parameters<typeof fetchOffer>) => fetchOffer(...args)
export const meOfferMessages = (...args: Parameters<typeof fetchOfferMessages>) => fetchOfferMessages(...args)

export const useOffers = (box: 'received' | 'sent', enabled = true) =>
  useQuery({ queryKey: ['offers', box], queryFn: () => meOffers(box), enabled })

export const useOffer = (id: string | undefined) =>
  useQuery({ queryKey: ['offer', id], queryFn: () => meOffer(id ?? ''), enabled: Boolean(id) })

export const useOfferMessages = (id: string | undefined) =>
  useQuery({
    queryKey: ['offer-messages', id],
    queryFn: () => meOfferMessages(id ?? ''),
    enabled: Boolean(id),
  })
