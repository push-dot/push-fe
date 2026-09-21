import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useT } from '@/shared/i18n'
import { Card, DropOverlay, Icon, StatusChip } from '@/shared/components'
import { cardMeta } from '@push/design-system'
import { useFileDrop } from '@/features/chat'
import type { StatusChipTone } from '@/shared/components'
import { type CliRunState } from '@/features/projects'
import { isProjectConversation, useConversations } from '@/features/chat'
import { ChatStream, Composer, useMessagesStore } from '@/features/chat'
import { useProjectPanels } from '@/features/projects'

const RUN_TONES: Record<CliRunState, StatusChipTone> = {
  DRAFT: 'pending',
  APPROVAL_REQUIRED: 'pending',
  RUNNING: 'running',
  VERIFYING: 'running',
  VERIFIED: 'verified',
  FAILED: 'error',
}

const ProjectPanels = ({ projectId }: { projectId: string }) => {
  const t = useT()
  const { data } = useProjectPanels(projectId)
  const runs = data?.runs ?? []
  const evidence = data?.evidence ?? []

  return (
    <>
      {runs.map((run) => (
        <Card key={run.id} title={t('chat.running')}>
          <StatusChip
            tone={RUN_TONES[run.state]}
            label={run.state}
            icon={run.state === 'RUNNING' ? <Icon name="loader-circle" size={16} /> : undefined}
          />
          <div className={cardMeta}>
            {run.executable}
            {run.arguments.length ? ` ${run.arguments.join(' ')}` : ''}
          </div>
        </Card>
      ))}
      {evidence.map((item) => (
        <Card key={item.id} title={t('chat.verified')}>
          <StatusChip
            tone={
              item.status === 'VERIFIED'
                ? 'verified'
                : item.status === 'REJECTED'
                  ? 'error'
                  : 'pending'
            }
            label={item.status}
            icon={item.status === 'VERIFIED' ? 'badge-check' : undefined}
          />
          {item.summary ? <div className={cardMeta}>{item.summary}</div> : null}
        </Card>
      ))}
    </>
  )
}

const ChatPage = () => {
  const dragging = useFileDrop()
  const { id = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: conversations = [] } = useConversations()
  const conversation = conversations.find((c) => c.id === id)
  const messages = useMessagesStore((s) => s.messages)
  const status = useMessagesStore((s) => s.status)
  const error = useMessagesStore((s) => s.error)
  const sendStatus = useMessagesStore((s) => s.sendStatus)
  const failed = useMessagesStore((s) => s.failed)
  const hasMore = useMessagesStore((s) => s.hasMore)
  const loadingMore = useMessagesStore((s) => s.loadingMore)
  const load = useMessagesStore((s) => s.load)
  const loadMore = useMessagesStore((s) => s.loadMore)
  const send = useMessagesStore((s) => s.send)
  const retry = useMessagesStore((s) => s.retry)
  const abort = useMessagesStore((s) => s.abort)

  useEffect(() => {
    void load(id)
  }, [id, load])

  const initialState = location.state as {
    initialMessage?: string
    initialEvidence?: { id: string; title: string }[]
  } | null

  useEffect(() => {
    if (!initialState?.initialMessage || status !== 'success') return
    void send(id, initialState.initialMessage, initialState.initialEvidence)
    navigate(location.pathname, { replace: true, state: null })
  }, [initialState, status, id, send, navigate, location.pathname])

  const isProject = conversation ? isProjectConversation(conversation) : false
  const projectId = conversation?.projectId ?? null

  return (
    <>
      {dragging ? <DropOverlay /> : null}
      <ChatStream
        messages={messages}
        status={status}
        error={error}
        sendStatus={sendStatus}
        failedText={failed?.error ?? null}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onTopReached={() => void loadMore()}
        onRetry={() => void load(id)}
        onRetrySend={() => void retry()}
        trailing={isProject && projectId ? <ProjectPanels projectId={projectId} /> : null}
      />
      <Composer
        sending={sendStatus === 'sending' || sendStatus === 'streaming'}
        onSend={(text, evidence) => void send(id, text, evidence)}
        onAbort={abort}
      />
    </>
  )
}

export default ChatPage
