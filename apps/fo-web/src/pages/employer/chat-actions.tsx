import { createContext, useContext } from 'react'
import type { ChatIntent } from '../../shared/model/employer-chat'

export type ChatActions = {
  busy: boolean
  picked: Record<string, string>
  send: (text: string, intent?: ChatIntent) => void
  answer: (cardId: string, optionId: string) => void
  focus: () => void
  redraft: () => void
  copied: () => void
}

const idle: ChatActions = { busy: true, picked: {}, send: () => undefined, answer: () => undefined, focus: () => undefined, redraft: () => undefined, copied: () => undefined }

export const ChatActionsContext = createContext<ChatActions>(idle)

export const useChatActions = () => useContext(ChatActionsContext)
