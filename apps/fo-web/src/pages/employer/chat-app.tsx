import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { useEmployerConversations } from '../../entities/conversation'
import { Icon } from '../../shared/ui/icon'
import { CHAT_LIST_LABEL, usedText } from './chat-copy'
import ChatSide, { UsageMeter } from './chat-side'
import { useChatUsage } from './chat-usage'
import { useStickToBottom } from './chat-scroll'
import { CHAT_NEW } from './constants'

type ChatAppProps = {
  screen: 'list' | 'new' | 'thread'
  activeId?: string
  title?: string
  dock?: ReactNode
  busy?: boolean
  children: ReactNode
}

const ChatApp = ({ screen, activeId, title, dock, busy, children }: ChatAppProps) => {
  const scroll = useRef<HTMLDivElement>(null)
  useStickToBottom(scroll, activeId)
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
          {/* A log reads additions politely; aria-busy holds the announcements back while a turn streams. */}
          <div className="chat-col" role="log" aria-live="polite" aria-busy={busy}>
            {children}
          </div>
        </div>
        {dock ? <div className="chat-dock">{dock}</div> : null}
      </section>
    </main>
  )
}

export default ChatApp
