import {
  meAcceptOffer as call0,
  meArchiveOffer as call3,
  meBlockUser as call6,
  meDeclineOffer as call1,
  meReportOffer as call5,
  meSendOfferMessage as call2,
  meUnarchiveOffer as call4,
} from '../../shared/api/operations'

export const meAcceptOffer = (...args: Parameters<typeof call0>) => call0(...args)
export const meDeclineOffer = (...args: Parameters<typeof call1>) => call1(...args)
export const meSendOfferMessage = (...args: Parameters<typeof call2>) => call2(...args)
export const meArchiveOffer = (...args: Parameters<typeof call3>) => call3(...args)
export const meUnarchiveOffer = (...args: Parameters<typeof call4>) => call4(...args)
export const meReportOffer = (...args: Parameters<typeof call5>) => call5(...args)
export const meBlockUser = (...args: Parameters<typeof call6>) => call6(...args)
