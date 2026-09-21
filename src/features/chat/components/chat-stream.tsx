import { useEffect, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ReactNode } from 'react'
import type { Message, MessageAttachment } from '../api/schemas'
import { useT } from '@/shared/i18n'
import { ApprovalCard } from '@/features/approval'
import { Button, ErrorState, Icon, IconButton, SkeletonRows, showToast } from '@/shared/components'
import { downloadVersionExport } from '@/features/documents'
import type { SendStatus } from '../stores'
import { useMessagesStore } from '../stores'

const TOP_LOAD_THRESHOLD = 120
const BOTTOM_THRESHOLD = 80

const AttachmentView = ({ attachment, user }: { attachment: MessageAttachment; user?: boolean }) => {
  const t = useT()
  if (attachment.type === 'APPROVAL') {
    return <ApprovalCard approvalId={attachment.id} />
  }
  const label =
    attachment.type === 'EVIDENCE'
      ? t('chat.evidenceLinked')
      : t('chat.docVersion')
  const exportAs = (format: 'PDF' | 'DOCX') => {
    if (attachment.type !== 'DOCUMENT_VERSION') return
    void downloadVersionExport(
      attachment.documentId, attachment.id, format, attachment.title,
    ).catch((error: unknown) => {
      showToast(error instanceof Error ? error.message : 'export failed', 'circle-alert')
    })
  }
  return (
    <div className={user ? 'chat-attach-chip chat-attach-chip-user' : 'chat-attach-chip'}>
      <Icon name="link-2" size={16} />
      <span className="chat-attach-chip-title">{attachment.title}</span>
      <span className="chat-attach-chip-meta">{label}</span>
      {attachment.type === 'DOCUMENT_VERSION' ? (
        <span className="chat-attach-chip-actions">
          <Button size="sm" variant="secondary" onClick={() => exportAs('PDF')}>
            {t('chat.exportPdf')}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => exportAs('DOCX')}>
            {t('chat.exportDocx')}
          </Button>
        </span>
      ) : null}
    </div>
  )
}

const MessageView = ({ message }: { message: Message }) => {
  const t = useT()
  const copy = () => {
    void navigator.clipboard.writeText(message.text).then(() => {
      showToast(t('chat.copied'), 'check')
    })
  }
  return (
    <div className="chat-stream-row">
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
            <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
          </div>
        )}
      </div>
      {message.attachments.map((a, i) => (
        <AttachmentView
          key={`${message.id}-${i}`}
          attachment={a}
          user={message.role === 'USER'}
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
}

const StreamingBubble = ({ onGrow }: { onGrow: () => void }) => {
  const text = useMessagesStore((s) => s.streamText)
  const status = useMessagesStore((s) => s.streamStatus)
  useEffect(() => {
    onGrow()
  }, [text, onGrow])
  return (
    <div className="chat-stream-row">
      <div className="chat-stream-msg chat-stream-msg-ai chat-stream-msg-live">
        {status && !text ? <div className="chat-stream-status">{status}…</div> : null}
        {text ? (
          <div className="chat-md">
            <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
          </div>
        ) : ' '}
        <span className="chat-stream-cursor" />
      </div>
    </div>
  )
}

type ChatStreamProps = {
  messages: Message[]
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string | null
  sendStatus?: SendStatus
  failedText?: string | null
  hasMore?: boolean
  loadingMore?: boolean
  onTopReached?: () => void
  onRetry?: () => void
  onRetrySend?: () => void
  trailing?: ReactNode
}

const ChatStream = ({
  messages,
  status,
  error,
  sendStatus = 'idle',
  failedText = null,
  hasMore = false,
  loadingMore = false,
  onTopReached,
  onRetry,
  onRetrySend,
  trailing,
}: ChatStreamProps) => {
  const t = useT()
  const listRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const [showJump, setShowJump] = useState(false)

  const streaming = sendStatus === 'sending' || sendStatus === 'streaming'

  const pinToBottom = () => {
    const el = listRef.current
    if (!el || !atBottomRef.current) return
    el.scrollTop = el.scrollHeight
  }

  useEffect(() => {
    pinToBottom()
  }, [messages.length, streaming])

  const onScroll = () => {
    const el = listRef.current
    if (!el) return
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD
    atBottomRef.current = atBottom
    setShowJump(!atBottom)
    if (el.scrollTop < TOP_LOAD_THRESHOLD && hasMore && !loadingMore) {
      onTopReached?.()
    }
  }

  const jumpToBottom = () => {
    atBottomRef.current = true
    setShowJump(false)
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }

  if (status === 'loading') {
    return (
      <div className="chat-stream">
        <SkeletonRows count={4} />
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="canvas-body">
        <ErrorState message={error ?? undefined} onRetry={onRetry} />
      </div>
    )
  }
  if (messages.length === 0 && !streaming) {
    return <div className="chat-stream" />
  }
  return (
    <div className="chat-stream-virtual">
      {loadingMore ? <div className="chat-stream-loading">{t('chat.loadingMore')}</div> : null}
      <div ref={listRef} className="chat-vlist" onScroll={onScroll}>
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
        {streaming ? <StreamingBubble onGrow={pinToBottom} /> : null}
        {failedText !== null ? (
          <div className="chat-stream-row">
            <div className="chat-stream-failed">
              <Icon name="circle-alert" size={16} />
              <span>{failedText}</span>
              {onRetrySend ? (
                <Button size="sm" variant="secondary" onClick={onRetrySend}>
                  {t('common.retry')}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {trailing}
      </div>
      {showJump ? (
        <IconButton
          className="chat-jump-bottom"
          icon="arrow-down"
          aria-label={t('chat.jumpLatest')}
          onClick={jumpToBottom}
        />
      ) : null}
    </div>
  )
}

export default ChatStream
