import {
  authStart as call0,
  authEmailLogin as call1,
  authExchange as call2,
  authPhoneSend as call3,
  authPhoneVerify as call4,
} from '../../shared/api/operations'

export const authStart = (...args: Parameters<typeof call0>) => call0(...args)
export const authEmailLogin = (...args: Parameters<typeof call1>) => call1(...args)
export const authExchange = (...args: Parameters<typeof call2>) => call2(...args)
export const authPhoneSend = (...args: Parameters<typeof call3>) => call3(...args)
export const authPhoneVerify = (...args: Parameters<typeof call4>) => call4(...args)
