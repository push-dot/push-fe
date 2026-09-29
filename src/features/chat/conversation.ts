import type { Conversation } from './api/schemas'

export const isProjectConversation = (conversation: Conversation): boolean =>
  conversation.projectId != null
