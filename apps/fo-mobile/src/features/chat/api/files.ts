import { Linking } from 'react-native'
import { API_BASE_URL, openBrowser, pickDocument } from '../../../shared/infrastructure'

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

export const artifactUrl = (path: string) => `${API_BASE_URL}${path}`

export const openExternal = (url: string) => openBrowser(url)

export const openLink = (url: string) => Linking.openURL(url)
