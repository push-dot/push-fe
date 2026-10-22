import type { AccessMode, Message, StreamEvent } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'

import { isMock } from '../../shared/lib/bridge'
import { pdfLocked, type ChatIntent } from '../../shared/model/employer-chat'
import ChatApp from './chat-app'
import ChatComposer from './chat-composer'
import ChatLock from './chat-lock'
import ChatApprovalCard from './chat-approval-card'
import ChatMessage from './chat-message'
import ChatToolRow from './chat-tool-row'
import {
  answerApproval,
  applyTurnEvent,
  approvalFailureFrom,
  chatGateFrom,
  chatRouteState,
  chatTurnDeps,
  conversationsAttach,
  conversationsSend,
  DEFAULT_ACCESS_MODE,
  EMPTY_TURN,
  runTurn,
  type ApprovalFailure,
  type ChatBlock,
  type ChatTurn,
} from '../../features/employer-chat'
import { meUpdateSettings } from '../../features/update-settings'
import {
  APPROVAL_FAILURE,
  AWAITING_APPROVAL,
  CHAT_BUSY,
  CHAT_CREDITS,
  CHAT_FAILED,
  CHAT_LOADING,
  CHAT_TITLE,
  INTERVIEW_LOCK,
  REFERENCE_POSTING,
  VERIFY_LINK,
} from './constants'
import { useEmployerApplicants } from '../../entities/application'
import { useEmployerPlan } from '../../entities/company'
import { useEmployerConversations, useEmployerMessages } from '../../entities/conversation'
import { useMyPostings } from '../../entities/posting'
import { useSettings } from '../../entities/session'


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
  const [turn, setTurn] = useState<ChatTurn | null>(null)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [answerFailure, setAnswerFailure] = useState<ApprovalFailure | null>(null)
  const [sending, setSending] = useState(false)
  const settings = useSettings()
  const [chosenMode, setChosenMode] = useState<AccessMode | null>(null)
  const accessMode = chosenMode ?? settings.data?.aiAccessMode ?? DEFAULT_ACCESS_MODE
  const saveMode = useMutation({
    mutationFn: (mode: AccessMode) => meUpdateSettings({ aiAccessMode: mode }),
    onSuccess: (next) => queryClient.setQueryData(['settings'], next),
  })
  useEffect(() => {
    setIntent(routed.intent)
  }, [id, routed.intent])
  const conversations = useEmployerConversations()
  const messages = useEmployerMessages(id)
  const postings = useMyPostings()
  const openPosting = postings.data?.data.find((item) => !item.closedAt)
  const applicants = useEmployerApplicants(openPosting?.id, undefined, {
    queryKey: ['employer-applicants', openPosting?.id, 'chat'],
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
  const streamed = turn?.text.trim() ?? ''
  const showStream = streamed !== '' && !rows.some((item) => item.role === 'ASSISTANT' && item.text.trim() === streamed)
  const waiting = turn?.awaiting === 'approval' && turn.items.some((item) => item.kind === 'approval' && !picked[item.id])
  const pdfDisabled = !settled || pdfLocked(plan)
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['employer-messages', id] })
  const payload = (value: string) => ({
    text: value,
    accessMode,
    intent,
    applicationId: applicationId || undefined,
  })
  const onEvent = (event: StreamEvent) => setTurn((current) => applyTurnEvent(current ?? EMPTY_TURN, event))
  const pickMode = (mode: AccessMode) => {
    setChosenMode(mode)
    saveMode.mutate(mode)
  }
  const answer = async (approvalId: string, optionId: string) => {
    if (sending || !id) return
    setSending(true)
    setAnswerFailure(null)
    setPicked((current) => ({ ...current, [approvalId]: optionId }))
    try {
      await answerApproval(chatTurnDeps, id, approvalId, optionId, onEvent)
    } catch (error) {
      const failure = approvalFailureFrom(error)
      setAnswerFailure(failure)
      if (failure === 'failed') setPicked(({ [approvalId]: _, ...rest }) => rest)
    } finally {
      setSending(false)
      await refresh()
    }
  }
  const attach = async (file: File) => {
    if (!id || pdfDisabled) return
    const form = new FormData()
    form.append('file', file)
    try {
      await conversationsAttach(id, form)
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
        await conversationsSend(id, payload(value))
        await refresh()
        return
      }
      setTurn(EMPTY_TURN)
      setPicked({})
      setAnswerFailure(null)
      await runTurn(chatTurnDeps, id, payload(value), onEvent)
      await refresh()
    } catch (error) {
      setGate(chatGateFrom(error))
      setText(value)
    } finally {
      setSending(false)
      setPending(null)
    }
  }
  const referencePosting = routed.postingId ? postings.data?.data.find((item) => item.id === routed.postingId) : undefined
  return (
    <ChatApp activeId={id}>
      <header className="head">
        <h1 className="h3">{title || CHAT_TITLE}</h1>
      </header>
      {reference ? (
        <div className="chat-ref">
          <span className="badge green">{REFERENCE_POSTING}</span>
          <span className="b2 w7">{referencePosting ? `${referencePosting.company} · ${referencePosting.title}` : title}</span>
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
        <ul className="chat-log">
          {rows.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {showPending && pending ? <ChatMessage key="pending" message={bubble(id, 'USER', pending)} /> : null}
          {(turn?.items ?? []).map((item) =>
            item.kind === 'tool' ? (
              <ChatToolRow key={item.key} tool={item} />
            ) : (
              <ChatApprovalCard key={item.id} approval={item} picked={picked[item.id]} busy={sending} onPick={(optionId) => void answer(item.id, optionId)} />
            ),
          )}
          {showStream ? <ChatMessage key="streaming" message={bubble(id, 'ASSISTANT', streamed)} /> : null}
        </ul>
      )}
      {waiting ? <p className="b2 t3 stack">{AWAITING_APPROVAL}</p> : null}
      {answerFailure ? (
        <p className="b1 stack" role="alert">
          {APPROVAL_FAILURE[answerFailure]}
        </p>
      ) : null}
      {gate === 'credits' || gate === 'busy' ? (
        <p className="b1 stack" role="alert">
          {gate === 'credits' ? CHAT_CREDITS : CHAT_BUSY}
        </p>
      ) : null}
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
        accessMode={accessMode}
        onAccessMode={pickMode}
        onText={setText}
        onApplication={setApplicationId}
        onFile={(file) => void attach(file)}
        onSubmit={(event) => void submit(event)}
      />
    </ChatApp>
  )
}

export default ChatThreadPage
