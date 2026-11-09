import { meAcceptOffer as call0, meDeclineOffer as call1, meSendOfferMessage as call2 } from '../../shared/api/operations'
import { api } from '../../shared/api/client'

export const meAcceptOffer = (...args: Parameters<typeof call0>) => call0(...args)
export const meDeclineOffer = (...args: Parameters<typeof call1>) => call1(...args)
export const meSendOfferMessage = (...args: Parameters<typeof call2>) => call2(...args)
export const meArchiveOffer = (id: string) => api.me.archiveOffer(id)
export const meUnarchiveOffer = (id: string) => api.me.unarchiveOffer(id)
export const meReportOffer = (id: string) => api.me.reportOffer(id)
export const meBlockUser = (userId: string) => api.me.blockUser(userId)
