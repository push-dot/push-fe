import { memo } from 'react'
import Markdown from 'react-markdown'
import type { Message } from '../api/schemas'
import { useT } from '@/shared/i18n'
import { Icon, showToast } from '@/shared/components'
import { REMARK_PLUGINS } from '../constants'
import type { VersionExportHandler } from '../types'
import AttachmentView from './attachment-view'

const MessageView = memo(
  ({
    message,
    rowRef,
    onExportVersion,
  }: {
    message: Message
    rowRef?: (el: HTMLDivElement | null) => void
    onExportVersion?: VersionExportHandler
  }) => {
    const t = useT()
    const copy = () => {
      void navigator.clipboard.writeText(message.text).then(() => {
        showToast(t('chat.copied'), 'check')
      })
    }
    return (
      <div ref={rowRef} className="chat-stream-row">
        <div
          className={[
            'chat-stream-msg',
            message.role === 'USER' ? 'chat-stream-msg-user' : 'chat-stream-msg-ai',
          ].join(' ')}
        >
          {message.role === 'USER' ? (
            message.text
          ) : (
            <div className="chat-md">
              <Markdown remarkPlugins={REMARK_PLUGINS}>{message.text}</Markdown>
            </div>
          )}
        </div>
        {message.attachments.map((a, i) => (
          <AttachmentView
            key={`${message.id}-${i}`}
            attachment={a}
            user={message.role === 'USER'}
            onExportVersion={onExportVersion}
          />
        ))}
        {message.role === 'ASSISTANT' && message.text ? (
          <div className="chat-msg-actions">
            <button
              type="button"
              className="chat-msg-action"
              aria-label={t('chat.copy')}
              onClick={copy}
            >
              <Icon name="copy" size={16} />
              <span>{t('chat.copy')}</span>
            </button>
          </div>
        ) : null}
      </div>
    )
  },
)

export default MessageView
