import type { Conversation } from '@push/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import ChatApp from './chat-app'
import ChatLock from './chat-lock'
import { chatGateFrom, conversationsCreateEmployer, type ChatBlock } from '../../features/employer-chat'
import { CHAT_CREATING, CHAT_FAILED, INTERVIEW_LOCK, PDF_LOCK, REFERENCE_POSTING, STARTER_POSTING, VERIFY_LINK } from './constants'


const flights = new Map<string, Promise<Conversation>>()

const ChatNewPage = () => {
  const [params] = useSearchParams()
  const postingId = params.get('postingId') || undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [gate, setGate] = useState<ChatBlock | null>(null)
  const started = useRef(false)
  useEffect(() => {
    if (started.current) return
    started.current = true
    const key = postingId ?? 'new'
    const existing = flights.get(key)
    const flight =
      existing ??
      conversationsCreateEmployer({
        title: postingId ? REFERENCE_POSTING : STARTER_POSTING,
        postingId,
      })
    if (!existing) flights.set(key, flight)
    void flight.then(
      async (created) => {
        flights.delete(key)
        await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
        navigate(`/employer/chat/${created.id}`, { replace: true, state: { postingId, intent: 'posting' } })
      },
      (error: unknown) => {
        flights.delete(key)
        setGate(chatGateFrom(error))
      },
    )
  }, [navigate, postingId, queryClient])
  return (
    <ChatApp>
      {gate === 'verify' ? (
        <Link className="text-link stack" to="/employer/verify">
          {VERIFY_LINK}
        </Link>
      ) : gate === 'interview' ? (
        <ChatLock message={INTERVIEW_LOCK} />
      ) : gate === 'pdf' ? (
        <p className="b2 t3 stack">{PDF_LOCK}</p>
      ) : gate === 'failed' ? (
        <p className="b1 stack" role="alert">
          {CHAT_FAILED}
        </p>
      ) : (
        <p className="b2 t3" aria-busy="true">
          {CHAT_CREATING}
        </p>
      )}
    </ChatApp>
  )
}

export default ChatNewPage
