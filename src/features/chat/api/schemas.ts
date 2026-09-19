

export type Conversation = {
  id: string
  revision: number
  applicationId: string | null
  projectId?: string
  title: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

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

export type AiOptions = {
  provider: 'OPENAI' | 'OPENROUTER' | 'CLAUDE' | 'GEMINI' | 'GROK'
  model: string
  credentialMode: 'MANAGED' | 'BYOK'
  effort: 'LOW' | 'MEDIUM' | 'HIGH'
  ultraResume?: boolean
  webSearch?: boolean
}

export type AccessMode = 'SUGGEST' | 'CONFIRM_ACTIONS'
