import { meUpdateSettings as call0, meDeleteAccount as call2, meUnblockUser as call3 } from '../../shared/api/operations'

export const meUpdateSettings = (...args: Parameters<typeof call0>) => call0(...args)
export const meDeleteAccount = (...args: Parameters<typeof call2>) => call2(...args)
export const meUnblockUser = (...args: Parameters<typeof call3>) => call3(...args)
