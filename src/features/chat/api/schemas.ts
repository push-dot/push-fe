export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export type MessageAttachment =
  | { type: 'DOCUMENT_VERSION'; id: string; documentId: string; title: string }
  | { type: 'EVIDENCE'; id: string; title: string }
  | { type: 'APPROVAL'; id: string }

export type Message = {
  id: string
  conversationId: string
  role: MessageRole
  text: string
  attachments: MessageAttachment[]
  operationId: string | null
  createdAt: string
}
