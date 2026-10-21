import { conversationsCreateEmployer as call0, conversationsAttach as call1, conversationsSend as call2, conversationsStream as call3 } from '../../shared/api/operations'

export const conversationsCreateEmployer = (...args: Parameters<typeof call0>) => call0(...args)
export const conversationsAttach = (...args: Parameters<typeof call1>) => call1(...args)
export const conversationsSend = (...args: Parameters<typeof call2>) => call2(...args)
export const conversationsStream = (...args: Parameters<typeof call3>) => call3(...args)
