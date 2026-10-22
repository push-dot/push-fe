import {
  conversationsAttach as call1,
  conversationsCreateEmployer as call0,
  conversationsFollow as call4,
  conversationsResolveApproval as call5,
  conversationsSend as call2,
  conversationsStream as call3,
} from '../../shared/api/operations'
import type { TurnDeps } from './chat-turn'

export const conversationsCreateEmployer = (...args: Parameters<typeof call0>) => call0(...args)
export const conversationsAttach = (...args: Parameters<typeof call1>) => call1(...args)
export const conversationsSend = (...args: Parameters<typeof call2>) => call2(...args)
export const conversationsStream = (...args: Parameters<typeof call3>) => call3(...args)

export const chatTurnDeps: TurnDeps = {
  stream: (id, body) => call3(id, body),
  follow: (id, after) => call4(id, after),
  resolve: (id, approvalId, optionId) => call5(id, approvalId, optionId),
}
