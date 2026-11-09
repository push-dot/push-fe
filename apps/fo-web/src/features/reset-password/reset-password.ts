import {
  authRequestPasswordReset as call0,
  authConfirmPasswordReset as call1,
  authPasswordResetEmail as call2,
} from '../../shared/api/operations'

export const authRequestPasswordReset = (...args: Parameters<typeof call0>) => call0(...args)
export const authConfirmPasswordReset = (...args: Parameters<typeof call1>) => call1(...args)
export const authPasswordResetEmail = (...args: Parameters<typeof call2>) => call2(...args)
