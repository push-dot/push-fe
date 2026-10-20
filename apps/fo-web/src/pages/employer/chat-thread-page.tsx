import { ApiError, type Message } from '@push/api-client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api } from '../../api'
import { isMock } from '../../bridge'
import { pdfLocked, type ChatIntent } from '../../shared/model/employer-chat'
import ChatComposer from './chat-composer'
import ChatLock from './chat-lock'
import ChatMessage from './chat-message'
import { chatGateFrom, chatRouteState, type ChatBlock } from './chat-gate'
import {
  CHAT_FAILED,
  CHAT_LOADING,
  CHAT_TITLE,
  INTERVIEW_LOCK,
  REFERENCE_POSTING,
  VERIFY_LINK,
} from './constants'
import { useEmployerPlan } from './use-employer-plan'

const bubble = (conversationId: string, role: Message['role'], text: string): Message => ({
  id: `${role}:${text}`,
  conversationId,
  role,
  text,
  attachments: [],
  operationId: null,
  createdAt: '',
})

const ChatThreadPage = () => {
  const { id = '' } = useParams()
  const location = useLocation()
  const routed = chatRouteState(location.state)
  const [intent, setIntent] = useState<ChatIntent>(routed.intent)
  const { plan, settled } = useEmployerPlan()
  const queryClient = useQueryClient()
  const [text, setText] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [gate, setGate] = useState<ChatBlock | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [streaming, setStreaming] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  useEffect(() => {
    setIntent(routed.intent)
  }, [id, routed.intent])
  const conversations = useQuery({
    queryKey: ['employer-conversations'],
    queryFn: () => api.conversations.list({ audience: 'EMPLOYER' }),
  })
  const messages = useQuery({
    queryKey: ['employer-messages', id],
    queryFn: () => api.conversations.messages(id),
    enabled: Boolean(id),
  })
  const postings = useQuery({ queryKey: ['company-postings'], queryFn: () => api.postings.mine() })
  const openPosting = postings.data?.data.find((item) => !item.closedAt)
  const applicants = useQuery({
    queryKey: ['employer-applicants', openPosting?.id, 'chat'],
    queryFn: () => api.postings.applicants(openPosting?.id ?? ''),
    enabled: Boolean(openPosting?.id),
  })
  const people = (applicants.data?.data ?? []).map((item) => ({
    applicationId: item.applicationId,
    name: item.applicant.displayName,
  }))
  const applicantName = people.find((person) => person.applicationId === applicationId)?.name ?? null
  const title = conversations.data?.data.find((item) => item.id === id)?.title
  const reference = Boolean(routed.postingId) || title === REFERENCE_POSTING
  const rows = messages.data?.data ?? []
  const showPending = pending !== null && !rows.some((item) => item.role === 'USER' && item.text === pending)
  const showStream = streaming !== null && !rows.some((item) => item.role === 'ASSISTANT' && item.text === streaming)
  const pdfDisabled = !settled || pdfLocked(plan)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['employer-messages', id] })
  const payload = (value: string) => ({
    text: value,
    accessMode: 'SUGGEST' as const,
    intent,
    applicationId: applicationId || undefined,
  })
  const attach = async (file: File) => {
    if (!id || pdfDisabled) return
    const form = new FormData()
    form.append('file', file)
    try {
      await api.conversations.attach(id, form)
    } catch (error) {
      setGate(chatGateFrom(error))
    }
  }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending || !id) return
    setSending(true)
    setGate(null)
    setText('')
    setPending(value)
    try {
      if (isMock()) {
        await api.conversations.send(id, payload(value))
        await refresh()
        return
      }
      let next = ''
      setStreaming('')
      try {
        for await (const chunk of api.conversations.stream(id, { text: value, accessMode: 'SUGGEST' })) {
          if (chunk.type === 'token') {
            next += chunk.text
            setStreaming(next)
          }
          if (chunk.type === 'error') {
            const details = chunk.error.details
            throw new ApiError(
              chunk.error.message,
              chunk.error.code,
              0,
              details && typeof details === 'object' && !Array.isArray(details) ? (details as Record<string, unknown>) : null,
            )
          }
        }
        await refresh()
      } catch {
        setStreaming(null)
        await api.conversations.send(id, payload(value))
        await refresh()
      }
    } catch (error) {
      setGate(chatGateFrom(error))
      setText(value)
    } finally {
      setSending(false)
      setPending(null)
      setStreaming(null)
    }
  }
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{title || CHAT_TITLE}</h1>
      </header>
      {reference ? (
        <div className="chips">
          <span className="chip">{REFERENCE_POSTING}</span>
        </div>
      ) : null}
      {gate === 'interview' ? <ChatLock message={INTERVIEW_LOCK} /> : null}
      {gate === 'verify' ? (
        <Link className="text-link stack" to="/employer/verify">
          {VERIFY_LINK}
        </Link>
      ) : null}
      {messages.isError ? (
        <p className="b1 stack" role="alert">
          {CHAT_FAILED}
        </p>
      ) : !messages.data ? (
        <p className="b2 t3 stack">{CHAT_LOADING}</p>
      ) : (
        <ul className="activity-list stack">
          {rows.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {showPending && pending ? <ChatMessage key="pending" message={bubble(id, 'USER', pending)} /> : null}
          {showStream && streaming !== null ? <ChatMessage key="streaming" message={bubble(id, 'ASSISTANT', streaming)} /> : null}
        </ul>
      )}
      {gate === 'failed' ? (
        <p className="b1 stack" role="alert">
          {CHAT_FAILED}
        </p>
      ) : null}
      <ChatComposer
        text={text}
        sending={sending}
        applicationId={applicationId}
        people={people}
        applicantName={applicantName}
        pdfDisabled={pdfDisabled}
        showPdfNote={gate === 'pdf' || (settled && pdfLocked(plan))}
        onText={setText}
        onApplication={setApplicationId}
        onFile={(file) => void attach(file)}
        onSubmit={(event) => void submit(event)}
      />
    </main>
  )
}

export default ChatThreadPage
