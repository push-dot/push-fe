import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { isHttpUrl } from '@/shared/lib/url'
import { showToast } from '@/shared/ui'
import { useConversationsStore } from '@/entities/conversation'
import { Composer } from '@/features/chat'
import { JobAddDialog } from '@/features/job-add'

const HomePage = () => {
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
      showToast(error instanceof Error ? error.message : '실행하지 못했어요', 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="canvas-body">
        <div className="center">
          <h1 className="t-display">무엇을 도와드릴까요?</h1>
          <div className="home-composer">
            <Composer sending={busy} onSend={(text) => void submit(text)} />
          </div>
        </div>
      </div>
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
