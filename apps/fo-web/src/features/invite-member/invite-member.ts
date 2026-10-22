import { companiesInvite as call0, companiesRemoveMember as call1, companiesTransferAdmin as call2 } from '../../shared/api/operations'

export const companiesInvite = (...args: Parameters<typeof call0>) => call0(...args)
export const companiesRemoveMember = (...args: Parameters<typeof call1>) => call1(...args)
export const companiesTransferAdmin = (...args: Parameters<typeof call2>) => call2(...args)
