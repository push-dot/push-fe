import { authStart as call0, authEmailLogin as call1, authExchange as call2 } from '../../shared/api/operations'

export const authStart = (...args: Parameters<typeof call0>) => call0(...args)
export const authEmailLogin = (...args: Parameters<typeof call1>) => call1(...args)
export const authExchange = (...args: Parameters<typeof call2>) => call2(...args)
export { mockSession } from '../../shared/api/mock'
