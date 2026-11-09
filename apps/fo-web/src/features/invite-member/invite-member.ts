import {
  companiesCancelInvite as cancelInvite,
  companiesInvite as call0,
  companiesInvites as listInvites,
  companiesRemoveMember as call1,
  companiesResendInvite as resendInvite,
  companiesTransferAdmin as call2,
} from '../../shared/api/operations'

export const companiesInvite = (...args: Parameters<typeof call0>) => call0(...args)
export const companiesRemoveMember = (...args: Parameters<typeof call1>) => call1(...args)
export const companiesTransferAdmin = (...args: Parameters<typeof call2>) => call2(...args)
export const companiesInvites = (...args: Parameters<typeof listInvites>) => listInvites(...args)
export const companiesResendInvite = (...args: Parameters<typeof resendInvite>) => resendInvite(...args)
export const companiesCancelInvite = (...args: Parameters<typeof cancelInvite>) => cancelInvite(...args)
