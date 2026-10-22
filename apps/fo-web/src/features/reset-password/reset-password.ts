import { authRequestPasswordReset as call0, authConfirmPasswordReset as call1 } from '../../shared/api/operations'

export const authRequestPasswordReset = (...args: Parameters<typeof call0>) => call0(...args)
export const authConfirmPasswordReset = (...args: Parameters<typeof call1>) => call1(...args)
