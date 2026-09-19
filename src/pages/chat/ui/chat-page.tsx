import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useT } from '@/shared/i18n'
import { Card, Icon, StatusChip, showToast } from '@/shared/ui'
import { uploadSource } from '@/shared/api'
import type { StatusChipTone } from '@/shared/ui'
import type { CliRunState } from '@/shared/api'
import { isProjectConversation, useConversationsStore } from '@/entities/conversation'
import { ChatStream, Composer, useMessagesStore } from '@/features/chat'
import { useProjectPanelsStore } from '../model/project-panels'

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
  const t = useT()
  const [dragging, setDragging] = useState(false)
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

  const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage

  useEffect(() => {
    if (!initialMessage || status !== 'success') return
    void send(id, initialMessage)
    navigate(location.pathname, { replace: true, state: null })
  }, [initialMessage, status, id, send, navigate, location.pathname])

  const isProject = conversation ? isProjectConversation(conversation) : false
  const projectId = conversation?.projectId ?? null

  useEffect(() => {
    let depth = 0
    const hasFiles = (e: DragEvent) => e.dataTransfer?.types.includes('Files') ?? false
    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth += 1
      setDragging(true)
    }
    const onDragOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault()
    }
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return
      depth -= 1
      if (depth <= 0) {
        depth = 0
        setDragging(false)
      }
    }
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      const files = Array.from(e.dataTransfer?.files ?? [])
      void (async () => {
        for (const file of files) {
          try {
            await uploadSource(file, 'RESUME')
            showToast(t('composer.uploaded'))
          } catch (error) {
            showToast(
              error instanceof Error ? error.message : t('composer.uploadFailed'),
              'circle-alert',
            )
          }
        }
      })()
    }
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [t])

  return (
    <>
      {dragging ? (
        <div className="drop-overlay">
          <Icon name="file-down" size={48} />
          <span>{t('composer.drop')}</span>
        </div>
      ) : null}
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
        onSend={(text) => void send(id, text)}
        onAbort={abort}
      />
    </>
  )
}

export default ChatPage
