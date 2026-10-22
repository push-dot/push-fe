import { meAcceptOffer as call0, meDeclineOffer as call1, meSendOfferMessage as call2 } from '../../shared/api/operations'

export const meAcceptOffer = (...args: Parameters<typeof call0>) => call0(...args)
export const meDeclineOffer = (...args: Parameters<typeof call1>) => call1(...args)
export const meSendOfferMessage = (...args: Parameters<typeof call2>) => call2(...args)
