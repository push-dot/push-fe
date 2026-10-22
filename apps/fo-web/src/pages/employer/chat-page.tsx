import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { intentLocked, type ChatIntent } from '../../shared/model/employer-chat'
import ChatApp from './chat-app'
import ChatLock from './chat-lock'
import { chatGateFrom, conversationsCreateEmployer, type ChatBlock } from '../../features/employer-chat'
import { CHAT_FAILED, INTERVIEW_LOCK, PDF_LOCK, STARTER_INTERVIEW, STARTER_POSTING, STARTER_REVIEW, VERIFY_LINK } from './constants'
import { useEmployerPlan } from '../../entities/company'


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
  const open = async (intent: ChatIntent, title: string) => {
    if (intent === 'interview' && !settled) return
    if (intentLocked(intent, plan)) {
      setGate('interview')
      return
    }
    try {
      const created = await conversationsCreateEmployer({ title })
      await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
      navigate(`/employer/chat/${created.id}`, { state: { intent } })
    } catch (error) {
      setGate(chatGateFrom(error))
    }
  }
  return (
    <ChatApp>
      <div className="chat-starters">
        {STARTERS.map((starter) => (
          <button key={starter.intent} type="button" className="btn sec" onClick={() => void open(starter.intent, starter.title)}>
            {starter.title}
          </button>
        ))}
      </div>
      {gate === 'interview' ? <ChatLock message={INTERVIEW_LOCK} /> : null}
      {gate === 'pdf' ? <p className="b2 t3">{PDF_LOCK}</p> : null}
      {gate === 'verify' || (settled && !verified) ? (
        <Link className="text-link" to="/employer/verify">
          {VERIFY_LINK}
        </Link>
      ) : null}
      {gate === 'failed' || failed ? (
        <p className="b1" role="alert">
          {CHAT_FAILED}
        </p>
      ) : null}
    </ChatApp>
  )
}

export default ChatPage
