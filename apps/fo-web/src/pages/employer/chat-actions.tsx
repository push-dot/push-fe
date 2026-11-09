import { createContext, useContext } from 'react'
import type { ChatIntent } from '../../shared/model/employer-chat'

export type ChatPerson = {
  applicationId: string
  name: string
  postingId: string
  postingTitle: string
}

export type ChatActions = {
  busy: boolean
  picked: Record<string, string>
  people: ChatPerson[]
  send: (text: string, intent?: ChatIntent) => void
  answer: (cardId: string, optionId: string) => void
  focus: () => void
  redraft: () => void
  copied: () => void
}

const idle: ChatActions = {
  busy: true,
  picked: {},
  people: [],
  send: () => undefined,
  answer: () => undefined,
  focus: () => undefined,
  redraft: () => undefined,
  copied: () => undefined,
}

export const ChatActionsContext = createContext<ChatActions>(idle)

export const useChatActions = () => useContext(ChatActionsContext)
