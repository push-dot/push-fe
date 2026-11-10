import {
  authEmailResendVerify as call1,
  authEmailVerify as call0,
} from '../../shared/api/operations'

export const authEmailVerify = (...args: Parameters<typeof call0>) => call0(...args)
export const authEmailResendVerify = (...args: Parameters<typeof call1>) => call1(...args)
