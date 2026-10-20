export type {
  Conversation,
  Message,
  MessageAttachment,
  MessageRole,
  MessageStreamEvent,
  SendMessageBody,
} from './api/schemas'
export type { SendStatus } from './stores'
export type VersionExportHandler = (
  documentId: string,
  versionId: string,
  format: 'PDF' | 'DOCX',
  title: string,
) => Promise<unknown>
