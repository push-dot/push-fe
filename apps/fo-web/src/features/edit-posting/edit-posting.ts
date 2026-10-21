import { postingsCreate as call0, postingsUpdate as call1, postingsClose as call2 } from '../../shared/api/operations'

export const postingsCreate = (...args: Parameters<typeof call0>) => call0(...args)
export const postingsUpdate = (...args: Parameters<typeof call1>) => call1(...args)
export const postingsClose = (...args: Parameters<typeof call2>) => call2(...args)
