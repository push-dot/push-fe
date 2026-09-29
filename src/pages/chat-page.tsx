import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { DropOverlay, showToast } from '@/shared/components'
import { useFileDrop } from '@/features/chat'
import { isProjectConversation, useConversations } from '@/features/chat'
import { ChatStream, Composer, ProjectPanels, useMessagesStore } from '@/features/chat'
import { useExportVersion } from '@/features/documents'
import { uploadPendingFiles } from '@/features/evidence'
import { InferenceSettings } from '@/features/inference'

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
  const exportVersion = useExportVersion()

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
        onExportVersion={(docId, versionId, format, title) =>
          exportVersion
            .mutateAsync({ documentId: docId, versionId, format, title })
            .catch((error: unknown) => {
              showToast(error instanceof Error ? error.message : 'export failed', 'circle-alert')
            })
        }
        trailing={isProject && projectId ? <ProjectPanels projectId={projectId} /> : null}
      />
      <Composer
        sending={sendStatus === 'sending' || sendStatus === 'streaming'}
        onSend={(text, evidence) => void send(id, text, evidence)}
        onUploadPending={uploadPendingFiles}
        onAbort={abort}
        settingsPanel={<InferenceSettings />}
      />
    </>
  )
}

export default ChatPage
