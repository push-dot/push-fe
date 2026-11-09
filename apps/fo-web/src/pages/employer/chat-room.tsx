import { ApiError, type AccessMode } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useEmployerApplicants } from '../../entities/application'
import { usePaymentsOpen } from '../../entities/billing'
import { useEmployerPlan, useMyCompany } from '../../entities/company'
import {
  useEmployerConversations,
  useEmployerMessages,
  useEmployerTurns,
} from '../../entities/conversation'
import { useMyPostings } from '../../entities/posting'
import { useSettings } from '../../entities/session'
import {
  answerApproval,
  applyTurnEvent,
  approvalFailureFrom,
  cancelTurn,
  chatGateFrom,
  chatRouteState,
  chatTurnDeps,
  conversationsAttach,
  conversationsCreateEmployer,
  DEFAULT_ACCESS_MODE,
  EMPTY_TURN,
  runTurn,
  threadItems,
  type ApprovalFailure,
  type ChatBlock,
  type LiveTurn,
  type ThreadItem,
} from '../../features/employer-chat'
import { meUpdateSettings } from '../../features/update-settings'
import { pdfLocked, type ChatIntent } from '../../shared/model/employer-chat'
import { PLAN_NAME } from '../../shared/model/employer-plan'
import { useToast } from '../../shared/ui/toast'
import { ChatActionsContext, type ChatActions, type ChatPerson } from './chat-actions'
import ChatAnswer, { ChatSay } from './chat-answer'
import ChatApp from './chat-app'
import ChatComposer from './chat-composer'
import { COPIED, DRAFT_REDO_ASK, PDF_NOTE } from './chat-copy'
import ChatLimitCard from './chat-limit-card'
import ChatLock from './chat-lock'
import ChatStarter from './chat-starter'
import ChatTurnView from './chat-turn-view'
import ChatUser from './chat-user'
import {
  APPROVAL_FAILURE,
  CHAT_BUSY,
  CHAT_FAILED,
  CHAT_LOADING,
  CHAT_STOP_FAILED,
  PDF_LOCK,
  streamErrorText,
  VERIFY_LINK,
} from './constants'

type Outgoing = { text: string; intent: ChatIntent; applicationId: string; file: File | null }

// The starter creates the conversation on the first send and hands that send to the thread it opens.
const handoffs = new Map<string, Outgoing>()

const titleOf = (text: string) => text.split('\n')[0]?.slice(0, 40) ?? text

const lastApplication = (items: ThreadItem[]) =>
  items
    .flatMap((item) => (item.kind === 'user' ? item.attachments : []))
    .filter((item) => item.type === 'APPLICATION')
    .at(-1)?.id

/** The agent screen: the starter (no `id`) or one conversation, both on the same composer and stream. */
const ChatRoom = ({ id, screen }: { id?: string; screen: 'list' | 'new' | 'thread' }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const toast = useToast()
  const routed = chatRouteState(location.state)
  const { plan, settled } = useEmployerPlan()
  const admin = useMyCompany().data?.role === 'ADMIN'
  const payable = usePaymentsOpen()
  const settings = useSettings()
  const [chosenMode, setChosenMode] = useState<AccessMode | null>(null)
  const accessMode = chosenMode ?? settings.data?.aiAccessMode ?? DEFAULT_ACCESS_MODE
  const saveMode = useMutation({
    mutationFn: (mode: AccessMode) => meUpdateSettings({ aiAccessMode: mode }),
    onSuccess: (next) => queryClient.setQueryData(['settings'], next),
  })
  const [intent, setIntent] = useState<ChatIntent>(routed.intent)
  const [text, setText] = useState('')
  const [applicationId, setApplicationId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [gate, setGate] = useState<ChatBlock | null>(null)
  const [alert, setAlert] = useState<string | null>(null)
  const [answerFailure, setAnswerFailure] = useState<ApprovalFailure | null>(null)
  const [live, setLive] = useState<LiveTurn | null>(null)
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const leaving = useRef<number | undefined>(undefined)
  const conversations = useEmployerConversations()
  const messages = useEmployerMessages(id)
  const turns = useEmployerTurns(id)
  const postings = useMyPostings()
  const openPosting = postings.data?.data.find((item) => !item.closedAt)
  const applicants = useEmployerApplicants(openPosting?.id, undefined, {
    queryKey: ['employer-applicants', openPosting?.id, 'chat'],
    enabled: Boolean(openPosting?.id),
  })
  const people: ChatPerson[] = (applicants.data?.data ?? []).map((item) => ({
    applicationId: item.applicationId,
    name: item.applicant.displayName,
    postingId: openPosting?.id ?? '',
    postingTitle: openPosting?.title ?? '',
  }))
  const title = conversations.data?.data.find((item) => item.id === id)?.title
  const items = threadItems(messages.data?.data ?? [], turns.data?.data ?? [], live)
  const lastTurn = items.at(-1)
  const lastCard = lastTurn?.kind === 'turn' ? lastTurn.turn.blocks.at(-1) : undefined
  const awaiting =
    lastTurn?.kind === 'turn' &&
    lastCard?.kind === 'approval' &&
    !{ ...lastTurn.picked, ...picked }[lastCard.id]
  const pdfDisabled = !settled || pdfLocked(plan)
  const planName = plan ? PLAN_NAME[plan] : null

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employer-messages', id] }),
      queryClient.invalidateQueries({ queryKey: ['employer-turns', id] }),
      queryClient.invalidateQueries({ queryKey: ['employer-conversations'] }),
    ])

  const knownIds = () => (messages.data?.data ?? []).map((message) => message.id)

  /** Returns true when the question stays on screen above the card the failure opens. */
  const fail = (error: unknown, value: string) => {
    const next = chatGateFrom(error)
    setGate(next)
    // The board keeps the question on screen above the lock and limit cards; anything else goes back to the composer.
    if (next === 'credits' || next === 'interview') return true
    setLive(null)
    setText(value)
    if (next === 'pdf' || next === 'verify') return false
    setAlert(
      next === 'busy' && !(error instanceof ApiError && error.code === 'QUEUE_BUSY')
        ? CHAT_BUSY
        : streamErrorText(error, payable),
    )
    return false
  }

  const run = async (conversationId: string, out: Outgoing) => {
    const person = people.find((item) => item.applicationId === out.applicationId)
    setSending(true)
    setGate(null)
    setAlert(null)
    setAnswerFailure(null)
    setPicked({})
    setLive({
      text: out.text,
      attachments: out.applicationId
        ? [{ type: 'APPLICATION', id: out.applicationId, title: person?.name }]
        : [],
      turn: null,
      known: knownIds(),
    })
    const controller = new AbortController()
    abort.current = controller
    let keep = false
    try {
      if (out.file) {
        const form = new FormData()
        form.append('file', out.file)
        await conversationsAttach(conversationId, form)
        setFile(null)
      }
      const body = {
        text: out.text,
        accessMode,
        intent: out.intent,
        applicationId: out.applicationId || undefined,
      }
      let first = true
      await runTurn(
        chatTurnDeps,
        conversationId,
        body,
        (event) => {
          // The job names the conversation when it starts; the list should not wait for the end of a long run.
          if (first) void queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
          first = false
          setLive(
            (current) =>
              current && { ...current, turn: applyTurnEvent(current.turn ?? EMPTY_TURN, event) },
          )
        },
        controller.signal,
      )
    } catch (error) {
      if (!controller.signal.aborted) keep = fail(error, out.text)
    } finally {
      // The stored messages and jobs replace the live turn once they are loaded, so the run never shows twice.
      await refresh()
      if (!keep) setLive(null)
      abort.current = null
      setSending(false)
    }
  }

  const start = async (out: Outgoing) => {
    setSending(true)
    setGate(null)
    setAlert(null)
    try {
      const created = await conversationsCreateEmployer({ title: titleOf(out.text) })
      handoffs.set(created.id, out)
      await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
      navigate(`/employer/chat/${created.id}`, { state: { intent: out.intent } })
    } catch (error) {
      setSending(false)
      fail(error, out.text)
    }
  }

  const send = (out: Outgoing) => {
    setApplicationId('')
    if (id) void run(id, out)
    else void start(out)
  }

  useEffect(() => {
    const out = id ? handoffs.get(id) : undefined
    if (!id || !out) return
    handoffs.delete(id)
    void run(id, out)
    // Runs once per conversation: the handoff is consumed on the first pass.
  }, [id])

  const answer = async (cardId: string, optionId: string) => {
    if (sending || !id) return
    setSending(true)
    setAnswerFailure(null)
    setPicked((current) => ({ ...current, [cardId]: optionId }))
    setLive(
      (current) =>
        current ?? { text: '', attachments: [], turn: EMPTY_TURN, known: knownIds() },
    )
    const controller = new AbortController()
    abort.current = controller
    try {
      await answerApproval(
        chatTurnDeps,
        id,
        cardId,
        optionId,
        (event) =>
          setLive(
            (current) =>
              current && { ...current, turn: applyTurnEvent(current.turn ?? EMPTY_TURN, event) },
          ),
        controller.signal,
      )
    } catch (error) {
      if (!controller.signal.aborted) {
        const failure = approvalFailureFrom(error)
        setAnswerFailure(failure)
        if (failure === 'failed') setPicked(({ [cardId]: _, ...rest }) => rest)
      }
    } finally {
      await refresh()
      setLive(null)
      abort.current = null
      setSending(false)
    }
  }

  const stop = () => {
    abort.current?.abort()
    // Closing the stream leaves the job running and spending credits, so the server is told to stop it too.
    if (id) cancelTurn(chatTurnDeps, id).catch(() => setAlert(CHAT_STOP_FAILED))
  }

  useEffect(() => {
    window.clearTimeout(leaving.current)
    // Deferred so React's dev double mount does not cancel the run the first mount started.
    return () => {
      leaving.current = window.setTimeout(() => abort.current?.abort(), 0)
    }
  }, [])

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim()
    if (!value || sending) return
    setText('')
    send({ text: value, intent, applicationId, file })
  }

  const actions: ChatActions = {
    busy: sending,
    picked,
    people,
    send: (value, nextIntent) => {
      if (sending) return
      if (nextIntent) setIntent(nextIntent)
      send({
        text: value,
        intent: nextIntent ?? intent,
        applicationId: applicationId || lastApplication(items) || '',
        file: null,
      })
    },
    answer: (cardId, optionId) => void answer(cardId, optionId),
    focus: () => document.getElementById('chat-input')?.focus(),
    redraft: () => send({ text: DRAFT_REDO_ASK, intent: 'posting', applicationId: '', file: null }),
    copied: () => toast.show(COPIED),
  }

  const pickMode = (mode: AccessMode) => {
    setChosenMode(mode)
    saveMode.mutate(mode)
  }

  const composer = (
    <ChatComposer
      text={text}
      sending={sending}
      awaiting={awaiting}
      applicationId={applicationId}
      people={people}
      file={file}
      pdfLocked={pdfDisabled}
      accessMode={accessMode}
      onAccessMode={pickMode}
      onText={setText}
      onApplication={setApplicationId}
      onFile={setFile}
      onStop={stop}
      onSubmit={submit}
    />
  )
  const dock =
    gate === 'credits' ? (
      <ChatLimitCard ultra={plan === 'ULTRA'} admin={admin} payable={payable} />
    ) : (
      composer
    )
  const thread = id && !live && !messages.data
  return (
    <ChatActionsContext.Provider value={actions}>
      <ChatApp
        screen={screen}
        activeId={id}
        title={id ? title : undefined}
        dock={dock}
        busy={sending}
      >
        {!id && items.length === 0 ? (
          file ? (
            <ChatSay text={PDF_NOTE} soft />
          ) : (
            <ChatStarter
              applicant={people[0]?.name}
              onPick={(card) => {
                setIntent(card.intent)
                setText(card.example)
                actions.focus()
              }}
            />
          )
        ) : null}
        {id && messages.isError ? (
          <p className="b1" role="alert">
            {CHAT_FAILED}
          </p>
        ) : thread ? (
          <p className="b2 t3">{CHAT_LOADING}</p>
        ) : null}
        {items.map((item, index) => {
          if (item.kind === 'user')
            return <ChatUser key={item.key} text={item.text} attachments={item.attachments} />
          if (item.kind === 'reply')
            return <ChatAnswer key={item.key} text={item.text} live={false} after="start" />
          return (
            <ChatTurnView
              key={item.key}
              item={item}
              applicationId={lastApplication(items.slice(0, index))}
            />
          )
        })}
        {id && file && items.length === 0 ? <ChatSay text={PDF_NOTE} soft /> : null}
        {gate === 'interview' ? <ChatLock plan={planName} /> : null}
        {gate === 'pdf' ? <p className="c1 t3">{PDF_LOCK}</p> : null}
        {gate === 'verify' ? (
          <Link className="text-link" to="/employer/verify">
            {VERIFY_LINK}
          </Link>
        ) : null}
        {answerFailure ? (
          <p className="b2" role="alert">
            {APPROVAL_FAILURE[answerFailure]}
          </p>
        ) : null}
        {alert ? (
          <p className="b2" role="alert">
            {alert}
          </p>
        ) : null}
      </ChatApp>
    </ChatActionsContext.Provider>
  )
}

export default ChatRoom
