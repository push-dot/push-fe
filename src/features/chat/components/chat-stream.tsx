import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { VList } from 'virtua'
import type { VListHandle } from 'virtua'
import { Message, MessageAttachment } from '../api-conversations'
import { useT } from '@/shared/i18n'
import { ApprovalCard } from '@/features/approval'
import { Button, Card, ErrorState, Icon, IconButton, SkeletonRows } from '@/shared/components'
import type { SendStatus } from '../hooks'

const TOP_LOAD_THRESHOLD = 120
const BOTTOM_THRESHOLD = 80

const AttachmentView = ({ attachment }: { attachment: MessageAttachment }) => {
  const t = useT()
  if (attachment.type === 'APPROVAL') {
    return <ApprovalCard approvalId={attachment.id} />
  }
  if (attachment.type === 'EVIDENCE') {
    return (
      <Card title={attachment.title}>
        <span className="card-meta">
          <Icon name="link-2" size={16} /> {t('chat.evidenceLinked')}
        </span>
      </Card>
    )
  }
  return (
    <Card title={attachment.title}>
      <span className="card-meta">{t('chat.docVersion')}</span>
    </Card>
  )
}

const MessageView = ({ message }: { message: Message }) => (
  <div className="chat-stream-row">
    <div
      className={[
        'chat-stream-msg',
        message.role === 'USER' ? 'chat-stream-msg-user' : 'chat-stream-msg-ai',
      ].join(' ')}
    >
      {message.text}
    </div>
    {message.attachments.map((a, i) => (
      <AttachmentView key={`${message.id}-${i}`} attachment={a} />
    ))}
  </div>
)

const StreamingBubble = ({ text }: { text: string }) => (
  <div className="chat-stream-row">
    <div className="chat-stream-msg chat-stream-msg-ai chat-stream-msg-live">
      {text || ' '}
      <span className="chat-stream-cursor" />
    </div>
  </div>
)

type ChatStreamProps = {
  messages: Message[]
  status: 'idle' | 'loading' | 'success' | 'error'
  error?: string | null
  sendStatus?: SendStatus
  streamText?: string
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
  streamText = '',
  failedText = null,
  hasMore = false,
  loadingMore = false,
  onTopReached,
  onRetry,
  onRetrySend,
  trailing,
}: ChatStreamProps) => {
  const t = useT()
  const listRef = useRef<VListHandle>(null)
  const atBottomRef = useRef(true)
  const [showJump, setShowJump] = useState(false)

  const streaming = sendStatus === 'sending' || sendStatus === 'streaming'

  useEffect(() => {
    if (!atBottomRef.current || messages.length === 0) return
    listRef.current?.scrollToIndex(messages.length - 1, { align: 'end' })
  }, [messages.length, streamText])

  const onScroll = (offset: number) => {
    const list = listRef.current
    if (!list) return
    const atBottom = list.scrollSize - offset - list.viewportSize < BOTTOM_THRESHOLD
    atBottomRef.current = atBottom
    setShowJump(!atBottom)
    if (offset < TOP_LOAD_THRESHOLD && hasMore && !loadingMore) onTopReached?.()
  }

  const jumpToBottom = () => {
    atBottomRef.current = true
    setShowJump(false)
    if (messages.length > 0) {
      listRef.current?.scrollToIndex(messages.length - 1, { align: 'end' })
    }
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
      <VList ref={listRef} className="chat-vlist" shift onScroll={onScroll}>
        {messages.map((m) => (
          <MessageView key={m.id} message={m} />
        ))}
        {streaming ? <StreamingBubble text={streamText} /> : null}
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
      </VList>
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
