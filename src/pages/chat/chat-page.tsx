import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useT } from '@/shared/i18n'
import { Card, DropOverlay, StatusChip } from '@/shared/components'
import { useFileDrop } from '@/features/chat'
import type { StatusChipTone } from '@/shared/components'
import { type CliRunState } from '@/features/projects'
import { isProjectConversation, useConversationsStore } from '@/features/conversations'
import { ChatStream, Composer, useMessagesStore } from '@/features/chat'
import { useProjectPanelsStore } from '@/features/projects'

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
  const runs = useProjectPanelsStore((s) => s.runs)
  const evidence = useProjectPanelsStore((s) => s.evidence)
  const load = useProjectPanelsStore((s) => s.load)

  useEffect(() => {
    void load(projectId)
  }, [projectId, load])

  return (
    <>
      {runs.map((run) => (
        <Card key={run.id} title={t('chat.running')}>
          <StatusChip
            tone={RUN_TONES[run.state]}
            label={run.state}
            icon={run.state === 'RUNNING' ? 'loader-circle' : undefined}
          />
          <div className="card-meta">
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
          {item.summary ? <div className="card-meta">{item.summary}</div> : null}
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
  const conversation = useConversationsStore((s) => s.items.find((c) => c.id === id))
  const messages = useMessagesStore((s) => s.messages)
  const status = useMessagesStore((s) => s.status)
  const error = useMessagesStore((s) => s.error)
  const sendStatus = useMessagesStore((s) => s.sendStatus)
  const streamText = useMessagesStore((s) => s.streamText)
  const failed = useMessagesStore((s) => s.failed)
  const hasMore = useMessagesStore((s) => s.hasMore)
  const loadingMore = useMessagesStore((s) => s.loadingMore)
  const load = useMessagesStore((s) => s.load)
  const loadMore = useMessagesStore((s) => s.loadMore)
  const send = useMessagesStore((s) => s.send)
  const retry = useMessagesStore((s) => s.retry)
  const abort = useMessagesStore((s) => s.abort)
  const loadConversations = useConversationsStore((s) => s.load)

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  useEffect(() => {
    void load(id)
  }, [id, load])

  const initialState = location.state as {
    initialMessage?: string
    initialEvidenceIds?: string[]
  } | null

  useEffect(() => {
    if (!initialState?.initialMessage || status !== 'success') return
    void send(id, initialState.initialMessage, initialState.initialEvidenceIds)
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
        streamText={streamText}
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
        onSend={(text, evidenceIds) => void send(id, text, evidenceIds)}
        onAbort={abort}
      />
    </>
  )
}

export default ChatPage
