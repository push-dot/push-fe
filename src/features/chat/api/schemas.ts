import type { Operation } from '@/shared/api'
import type { AccessMode, AiOptions } from '@/features/inference'

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
export type MessageStreamEvent =
  | { type: 'token'; text: string }
  | { type: 'done'; operation: Operation }
  | {
      type: 'error'
      error: { code: string; message: string; details?: Record<string, unknown> }
    }

export type SendMessageBody = {
  text: string
  context: { documentId?: string; versionId?: string; evidenceIds: string[] }
  ai: AiOptions
  accessMode: AccessMode
}
