import { openBrowser, pickDocument } from '../../../shared/infrastructure'

export const CHAT_ATTACHMENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
]
export const CHAT_DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const pickChatAttachment = () =>
  pickDocument({ type: CHAT_ATTACHMENT_TYPES, copyToCacheDirectory: false })

export const pickChatDoc = () =>
  pickDocument({ type: CHAT_DOC_TYPES, copyToCacheDirectory: true })

export const openExternal = (url: string) => openBrowser(url)
