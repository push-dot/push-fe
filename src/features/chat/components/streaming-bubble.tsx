import { memo, useEffect, useMemo } from 'react'
import Markdown from 'react-markdown'
import { useMessagesStore } from '../stores'
import { splitStableMarkdown } from '../lib/markdown-split'
import { REMARK_PLUGINS } from '../constants'

const StableMarkdown = memo(Markdown)

const StreamingBubble = ({ onGrow }: { onGrow: () => void }) => {
  const text = useMessagesStore((s) => s.streamText)
  const status = useMessagesStore((s) => s.streamStatus)
  const { stable, tail } = useMemo(() => splitStableMarkdown(text), [text])
  useEffect(() => {
    onGrow()
  }, [text, onGrow])
  return (
    <div className="chat-stream-row">
      <div
        className="chat-stream-msg chat-stream-msg-ai chat-stream-msg-live"
        aria-live="polite"
      >
        {status && !text ? (
          <div className="chat-stream-status" role="status">
            {status}…
          </div>
        ) : null}
        {text ? (
          <div className="chat-md">
            {stable ? (
              <StableMarkdown remarkPlugins={REMARK_PLUGINS}>{stable}</StableMarkdown>
            ) : null}
            {tail ? (
              <Markdown remarkPlugins={REMARK_PLUGINS}>{tail}</Markdown>
            ) : null}
          </div>
        ) : ' '}
        <span className="chat-stream-cursor" />
      </div>
    </div>
  )
}

export default StreamingBubble
