import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useEmployerConversations } from '../../entities/conversation'
import { Icon } from '../../shared/ui/icon'
import { CHAT_LIST_LABEL, usedText } from './chat-copy'
import ChatSide, { UsageMeter } from './chat-side'
import { useChatUsage } from './chat-usage'
import { useStickToBottom, type OlderPages } from './chat-scroll'
import { CHAT_NEW } from './constants'

type ChatAppProps = {
  screen: 'list' | 'new' | 'thread'
  activeId?: string
  title?: string
  dock?: ReactNode
  /** Bumped on every send: the thread goes back to the newest message even when the reader had scrolled up. */
  pin?: number
  older?: OlderPages
  /** The finished reply, read out once: the thread itself is not a live region, so loading it reads nothing. */
  announce?: string
  children: ReactNode
}

const ChatApp = ({ screen, activeId, title, dock, pin, older, announce, children }: ChatAppProps) => {
  const scroll = useRef<HTMLDivElement>(null)
  useStickToBottom(scroll, `${activeId ?? ''}:${pin ?? 0}`, older)
  const conversations = useEmployerConversations()
  const usage = useChatUsage()
  return (
    <main className={`chat-app-main ${screen}`}>
      <ChatSide
        conversations={conversations.data?.data ?? []}
        activeId={activeId}
        loading={!conversations.data && !conversations.isError}
        failed={conversations.isError}
        usage={usage}
      />
      <section className="chat-thread">
        <div className="chat-top">
          <Link className="hbtn" to="/employer/chat" aria-label={CHAT_LIST_LABEL}>
            <Icon name="menu" size={20} width={2.2} />
          </Link>
          <span className="chat-top-title">
            <span className="b2 w7 cap">{title || CHAT_NEW}</span>
            {usage ? (
              <span className="c2 t3 chat-top-usage">
                <UsageMeter usage={usage} className="chat-top-meter" />
                <span className="cap">{`${usage.plan} · ${usedText(usage.percent)}`}</span>
              </span>
            ) : null}
          </span>
          <Link className="btn sec sm chat-top-new" to="/employer/chat/new">
            <Icon name="plus" size={20} width={2.4} />
            {CHAT_NEW}
          </Link>
        </div>
        <div className="chat-scroll" ref={scroll}>
          <div className="chat-col">{children}</div>
        </div>
        <p className="sr-only" role="status">
          {announce}
        </p>
        {dock ? <div className="chat-dock">{dock}</div> : null}
      </section>
    </main>
  )
}

export default ChatApp
