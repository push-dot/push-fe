import { meUpdateSettings as call0, meUpdateConsents as call1, meDeleteAccount as call2 } from '../../shared/api/operations'

export const meUpdateSettings = (...args: Parameters<typeof call0>) => call0(...args)
export const meUpdateConsents = (...args: Parameters<typeof call1>) => call1(...args)
export const meDeleteAccount = (...args: Parameters<typeof call2>) => call2(...args)
