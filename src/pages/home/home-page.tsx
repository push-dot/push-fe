import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import { useT } from '@/shared/i18n'
import { isHttpUrl } from '@/shared/lib/url'
import { DropOverlay, showToast } from '@/shared/components'
import { useExperiment, useExperimentConversion } from '@/shared/lib/experiment'
import { useFileDrop } from '@/features/chat'
import { useCreateConversation } from '@/features/chat'
import { Composer } from '@/features/chat'
import { JobAddDialog } from '@/features/jobs'

const HomePage = () => {
  const t = useT()
  const greetingVariant = useExperiment('home-greeting')
  const trackGreetingConversion = useExperimentConversion('home-greeting')
  const dragging = useFileDrop()
  const navigate = useNavigate()
  const createConversation = useCreateConversation()
  const [busy, setBusy] = useState(false)
  const [jobDialog, setJobDialog] = useState<{ open: boolean; source: string }>({
    open: false,
    source: '',
  })

  const submit = async (text: string, evidence: { id: string; title: string }[] = []) => {
    if (isHttpUrl(text) && evidence.length === 0) {
      setJobDialog({ open: true, source: text })
      return
    }
    setBusy(true)
    try {
      const conversation = await createConversation.mutateAsync({
        applicationId: null,
        title: text.slice(0, 40),
      })
      trackGreetingConversion()
      navigate(ROUTES.chat(conversation.id), {
        state: { initialMessage: text, initialEvidence: evidence },
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
          <h1 className="t-display">
            {t(greetingVariant === 'B' ? 'home.titleAlt' : 'home.title')}
          </h1>
        </div>
      </div>
      <Composer sending={busy} onSend={(text, evidence) => void submit(text, evidence)} />
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
