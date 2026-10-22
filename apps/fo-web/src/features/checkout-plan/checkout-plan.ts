import { billingCheckout as call0, billingTopup as call1 } from '../../shared/api/operations'

export const billingCheckout = (...args: Parameters<typeof call0>) => call0(...args)
export const billingTopup = (...args: Parameters<typeof call1>) => call1(...args)
