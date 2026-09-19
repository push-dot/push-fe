import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import { isHttpUrl } from '@/shared/lib/url'
import { DropOverlay, showToast } from '@/shared/ui'
import { useFileDrop } from '@/shared/lib/file-drop'
import { useConversationsStore } from '@/entities/conversation'
import { Composer } from '@/features/chat'
import { JobAddDialog } from '@/features/job-add'

const HomePage = () => {
  const t = useT()
  const dragging = useFileDrop()
  const navigate = useNavigate()
  const createConversation = useConversationsStore((s) => s.create)
  const [busy, setBusy] = useState(false)
  const [jobDialog, setJobDialog] = useState<{ open: boolean; source: string }>({
    open: false,
    source: '',
  })

  const submit = async (text: string) => {
    if (isHttpUrl(text)) {
      setJobDialog({ open: true, source: text })
      return
    }
    setBusy(true)
    try {
      const conversation = await createConversation({
        applicationId: null,
        title: text.slice(0, 40),
      })
      navigate(ROUTES.chat(conversation.id), {
        state: { initialMessage: text },
      })
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('toast.runFailed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {dragging ? <DropOverlay /> : null}
      <div className="canvas-body">
        <div className="center">
          <h1 className="t-display">{t('home.title')}</h1>
        </div>
      </div>
      <Composer sending={busy} onSend={(text) => void submit(text)} />
      <JobAddDialog
        open={jobDialog.open}
        initialSource={jobDialog.source}
        onClose={() => setJobDialog({ open: false, source: '' })}
        onCreated={() => {}}
      />
    </>
  )
}

export default HomePage
