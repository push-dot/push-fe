import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { intentLocked, type ChatIntent } from '../../shared/model/employer-chat'
import ChatLock from './chat-lock'
import ChatRow from './chat-row'
import { chatGateFrom, type ChatBlock } from './chat-gate'
import {
  CHAT_EMPTY,
  CHAT_FAILED,
  CHAT_LOADING,
  CHAT_TITLE,
  INTERVIEW_LOCK,
  PDF_LOCK,
  STARTER_INTERVIEW,
  STARTER_POSTING,
  STARTER_REVIEW,
  VERIFY_LINK,
} from './constants'
import { useEmployerPlan } from './use-employer-plan'

const STARTERS: { intent: ChatIntent; title: string }[] = [
  { intent: 'posting', title: STARTER_POSTING },
  { intent: 'review', title: STARTER_REVIEW },
  { intent: 'interview', title: STARTER_INTERVIEW },
]

const ChatPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { plan, settled, verified, failed } = useEmployerPlan()
  const [gate, setGate] = useState<ChatBlock | null>(null)
  const conversations = useQuery({
    queryKey: ['employer-conversations'],
    queryFn: () => api.conversations.list({ audience: 'EMPLOYER' }),
  })
  const open = async (intent: ChatIntent, title: string) => {
    if (intent === 'interview' && !settled) return
    if (intentLocked(intent, plan)) {
      setGate('interview')
      return
    }
    try {
      const created = await api.conversations.createEmployer({ title })
      await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
      navigate(`/employer/chat/${created.id}`, { state: { intent } })
    } catch (error) {
      setGate(chatGateFrom(error))
    }
  }
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{CHAT_TITLE}</h1>
      </header>
      <div className="shortcuts">
        {STARTERS.map((starter) => (
          <button key={starter.intent} type="button" className="shortcut" onClick={() => void open(starter.intent, starter.title)}>
            {starter.title}
          </button>
        ))}
      </div>
      {gate === 'interview' ? <ChatLock message={INTERVIEW_LOCK} /> : null}
      {gate === 'pdf' ? <p className="b2 t3 stack">{PDF_LOCK}</p> : null}
      {gate === 'verify' || (settled && !verified) ? (
        <Link className="text-link stack" to="/employer/verify">
          {VERIFY_LINK}
        </Link>
      ) : null}
      {gate === 'failed' || failed || conversations.isError ? (
        <p className="b1 stack" role="alert">
          {CHAT_FAILED}
        </p>
      ) : null}
      {conversations.isError ? null : !conversations.data ? (
        <p className="b2 t3 stack">{CHAT_LOADING}</p>
      ) : conversations.data.data.length === 0 ? (
        <p className="b2 t3 stack">{CHAT_EMPTY}</p>
      ) : (
        <ul className="activity-list stack">
          {conversations.data.data.map((conversation) => (
            <ChatRow key={conversation.id} conversation={conversation} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default ChatPage
