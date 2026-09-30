import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Message } from '../api/schemas'
import { useT } from '@/shared/i18n'
import { Button, ErrorState, Icon, IconButton, SkeletonRows } from '@/shared/components'
import type { SendStatus } from '../stores'
import { useVirtualRows } from '../lib/virtual-rows'
import type { VersionExportHandler } from '../types'
import MessageView from './message-view'
import StreamingBubble from './streaming-bubble'

const TOP_LOAD_THRESHOLD = 120
const BOTTOM_THRESHOLD = 80

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
  onExportVersion?: VersionExportHandler
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
  onExportVersion,
  trailing,
}: ChatStreamProps) => {
  const t = useT()
  const listRef = useRef<HTMLDivElement>(null)
  const atBottomRef = useRef(true)
  const [showJump, setShowJump] = useState(false)

  const streaming = sendStatus === 'sending' || sendStatus === 'streaming'

  const keyAt = useCallback((i: number) => messages[i].id, [messages])
  const virtual = useVirtualRows({
    count: messages.length,
    keyAt,
    listRef,
    pinnedRef: atBottomRef,
  })
  const visible = virtual.active
    ? messages.slice(virtual.start, virtual.end)
    : messages

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
    virtual.syncFromScroll()
    if (el.scrollTop < TOP_LOAD_THRESHOLD && hasMore && !loadingMore) {
      onTopReached?.()
    }
  }

  const jumpToBottom = () => {
    atBottomRef.current = true
    setShowJump(false)
    virtual.syncFromScroll()
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
      <div
        ref={listRef}
        className="chat-vlist"
        onScroll={onScroll}
        tabIndex={0}
        role="log"
        aria-label={t('chat.messages')}
      >
        {virtual.topPad > 0 ? <div style={{ height: virtual.topPad, flexShrink: 0 }} /> : null}
        {visible.map((m) => (
          <MessageView
            key={m.id}
            message={m}
            rowRef={virtual.active ? virtual.rowRef(m.id) : undefined}
            onExportVersion={onExportVersion}
          />
        ))}
        {virtual.bottomPad > 0 ? <div style={{ height: virtual.bottomPad, flexShrink: 0 }} /> : null}
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
