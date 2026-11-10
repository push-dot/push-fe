import {
  ApiError,
  type AccessMode,
  type ConversationTurn,
  type StreamEvent,
} from '@push/api-client'
import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
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
  acceptedFailure,
  answerApproval,
  applyTurnEvent,
  approvalFailureFrom,
  cancelTurn,
  chatGateFrom,
  chatRouteState,
  chatTurnDeps,
  composerAfterVanish,
  questionForComposer,
  conversationsAttach,
  conversationsCreateEmployer,
  DEFAULT_ACCESS_MODE,
  EMPTY_TURN,
  markStarted,
  markStopped,
  resumeStoredTurn,
  runTurn,
  threadItems,
  turnRunning,
  turnText,
  type ApprovalFailure,
  type ChatBlock,
  type ChatTurn,
  type LiveTurn,
  type RunState,
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
import { APPROVAL_NEEDED, COPIED, DRAFT_REDO_ASK, PDF_NOTE } from './chat-copy'
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

/** `held`: stopped while the conversation was being made, so the thread opens with the question unsent. */
type Handoff = Outgoing & { held?: boolean }

// The starter creates the conversation on the first send and hands that send to the thread it opens.
const handoffs = new Map<string, Handoff>()

type Job = RunState & { controller: AbortController | null }

const announced = (turn: ChatTurn) =>
  turnText(turn) || (turn.awaiting === 'approval' ? APPROVAL_NEEDED : '')

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
  const [halting, setHalting] = useState(false)
  const [sent, setSent] = useState(0)
  const [announce, setAnnounce] = useState('')
  const job = useRef<Job | null>(null)
  const attached = useRef<string | null>(null)
  const leaving = useRef<number | undefined>(undefined)
  const conversations = useEmployerConversations()
  const messages = useEmployerMessages(id)
  const turns = useEmployerTurns(id)
  const storedMessages = messages.data?.pages.flatMap((page) => page.data) ?? []
  const storedTurns = turns.data?.pages.flatMap((page) => page.data) ?? []
  const running = storedTurns.find(turnRunning)
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
  const items = threadItems(storedMessages, storedTurns, live)
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

  const knownIds = () => storedMessages.map((message) => message.id)

  const savedMessages = (conversationId: string) => {
    const cached = queryClient.getQueryData<
      InfiniteData<{ data: { id: string; role: string; text: string }[] }>
    >(['employer-messages', conversationId])
    return cached?.pages.flatMap((page) => page.data) ?? []
  }

  const pollNotice = streamErrorText(new ApiError('internal error', 'INTERNAL', 0), payable)
  const clearPollNotice = () => setAlert((current) => (current === pollNotice ? null : current))
  const watch = {
    onPollFailure: () => setAlert(pollNotice),
    onPollRecovered: clearPollNotice,
  }

  const begin = (controller: AbortController | null): Job => {
    const current = { started: false, stopped: false, controller }
    job.current = current
    return current
  }

  const release = (current: Job) => {
    if (job.current === current) job.current = null
  }

  const halt = (current: Job) => {
    current.controller?.abort()
    if (!id) return
    setHalting(true)
    // The stream's own refresh ran before the cancel committed; this one shows the job as stopped.
    cancelTurn(chatTurnDeps, id)
      .then(refresh, () => {
        setAlert(CHAT_STOP_FAILED)
        // The job is still running: following it again brings the stop button back.
        attached.current = null
      })
      .finally(() => setHalting(false))
  }

  /** Applies a frame to the live turn and remembers the whole turn for the read-out at the end. */
  const tracker = (current: Job, from: ChatTurn = EMPTY_TURN) => {
    let turn = from
    return {
      onEvent: (event: StreamEvent) => {
        if (markStarted(current)) halt(current)
        turn = applyTurnEvent(turn, event)
        setLive((live) => live && { ...live, turn: applyTurnEvent(live.turn ?? EMPTY_TURN, event) })
      },
      finished: () => {
        if (!current.controller?.signal.aborted) setAnnounce(announced(turn))
      },
    }
  }

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
    setSent((count) => count + 1)
    const controller = new AbortController()
    const current = begin(controller)
    const track = tracker(current)
    let keep = false
    let vanished: unknown = null
    const knownAtSend = knownIds()
    try {
      if (out.file) {
        const form = new FormData()
        form.append('file', out.file)
        await conversationsAttach(conversationId, form)
        setFile(null)
      }
      // Stopped during the upload: the question never left, so it goes back to the composer.
      if (current.stopped) {
        setText(out.text)
        return
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
          track.onEvent(event)
        },
        controller.signal,
        watch,
      )
      track.finished()
    } catch (error) {
      if (!controller.signal.aborted) {
        const accepted = acceptedFailure(error)
        // Kept: the job was accepted. DomainError may have deleted the question; the refresh decides.
        if (accepted === 'kept') {
          setAlert(streamErrorText(error, payable))
          vanished = error
        } else if (!current.started || accepted !== 'dropped') {
          keep = fail(error, out.text)
        }
      }
    } finally {
      // The stored messages and jobs replace the live turn once they are loaded, so the run never shows twice.
      await refresh()
      // DomainError INTERNAL / NOT_CONFIGURED deletes the question. Put it back when the refresh has no copy.
      const back = vanished
        ? questionForComposer(vanished, out.text, savedMessages(conversationId), knownAtSend)
        : null
      // `text` here is from the render that sent. Typing since then lives in state, so read that.
      if (back) setText((current) => composerAfterVanish(current, back))
      if (!keep) setLive(null)
      release(current)
      setSending(false)
    }
  }

  /**
   * Follows a job that kept running while this screen was closed.
   * The stored frames are not a cursor: push-be has already joined token rows into the first seq.
   */
  const follow = async (turn: ConversationTurn) => {
    if (!id) return
    const controller = new AbortController()
    const current = begin(controller)
    current.started = true
    const track = tracker(current)
    setSending(true)
    setLive({ text: '', attachments: [], turn: EMPTY_TURN, known: knownIds(), jobId: turn.jobId })
    try {
      await resumeStoredTurn(chatTurnDeps, id, turn, track.onEvent, controller.signal, watch)
      track.finished()
      clearPollNotice()
    } catch (error) {
      if (!controller.signal.aborted) setAlert(streamErrorText(error, payable))
    } finally {
      await refresh()
      setLive(null)
      release(current)
      setSending(false)
    }
  }

  const start = async (out: Outgoing) => {
    setSending(true)
    setGate(null)
    setAlert(null)
    const current = begin(null)
    try {
      const created = await conversationsCreateEmployer({ title: titleOf(out.text) })
      handoffs.set(created.id, current.stopped ? { ...out, held: true } : out)
      await queryClient.invalidateQueries({ queryKey: ['employer-conversations'] })
      navigate(`/employer/chat/${created.id}`, { state: { intent: out.intent } })
    } catch (error) {
      setSending(false)
      fail(error, out.text)
    } finally {
      release(current)
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
    if (out.held) {
      setText(out.text)
      setApplicationId(out.applicationId)
      setFile(out.file)
      return
    }
    void run(id, out)
    // Runs once per conversation: the handoff is consumed on the first pass.
  }, [id])

  useEffect(() => {
    if (!running || sending || halting || attached.current === running.jobId) return
    attached.current = running.jobId
    void follow(running)
    // Keyed on the job: a job is followed once, again only after a stop that did not reach push-be.
  }, [running?.jobId, sending, halting])

  const answer = async (cardId: string, optionId: string) => {
    if (sending || !id) return
    setSending(true)
    setAnswerFailure(null)
    setPicked((current) => ({ ...current, [cardId]: optionId }))
    setLive(
      (current) => current ?? { text: '', attachments: [], turn: EMPTY_TURN, known: knownIds() },
    )
    const controller = new AbortController()
    const current = begin(controller)
    const track = tracker(current)
    try {
      await answerApproval(
        chatTurnDeps,
        id,
        cardId,
        optionId,
        track.onEvent,
        controller.signal,
        watch,
      )
      track.finished()
    } catch (error) {
      if (!controller.signal.aborted) {
        const failure = approvalFailureFrom(error)
        setAnswerFailure(failure)
        if (failure === 'failed') setPicked(({ [cardId]: _, ...rest }) => rest)
      }
    } finally {
      await refresh()
      setLive(null)
      release(current)
      setSending(false)
    }
  }

  // Closing the stream leaves the job running and spending credits, so the server is told to stop it too.
  const stop = () => {
    const current = job.current
    if (current && markStopped(current)) halt(current)
  }

  useEffect(() => {
    window.clearTimeout(leaving.current)
    // Deferred so React's dev double mount does not cancel the run the first mount started.
    return () => {
      leaving.current = window.setTimeout(() => job.current?.controller?.abort(), 0)
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
        pin={sent}
        announce={announce}
        older={{
          more: Boolean(messages.hasNextPage || turns.hasNextPage),
          loading: messages.isFetchingNextPage || turns.isFetchingNextPage,
          load: () => {
            if (messages.hasNextPage) void messages.fetchNextPage()
            if (turns.hasNextPage) void turns.fetchNextPage()
          },
        }}
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
