import { useState } from 'react'
import { form, formRowHint, sprinkles } from '@push/design-system'
import { Button, Dialog, Input, Select, showToast } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { Application } from '@/features/applications'
import { useCreateInterview } from '../api/hooks'

type InterviewAddDialogProps = {
  open: boolean
  onClose: () => void
  applications: Pick<Application, 'id' | 'company' | 'title'>[]
}

const InterviewAddDialog = ({ open, onClose, applications }: InterviewAddDialogProps) => {
  const t = useT()
  const create = useCreateInterview()
  const [applicationId, setApplicationId] = useState('')
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!applicationId || !title.trim() || !scheduledAt) return
    setBusy(true)
    try {
      await create.mutateAsync({
        applicationId,
        title: title.trim(),
        scheduledAt: new Date(scheduledAt).toISOString(),
      })
      showToast(t('interviewDialog.created'), 'check')
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('interviewDialog.failed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={t('interviewDialog.title')}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('interviewDialog.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={busy}
            disabled={!applicationId || !title.trim() || !scheduledAt}
            onClick={() => void submit()}
          >
            {t('interviewDialog.add')}
          </Button>
        </>
      }
    >
      <div className={[form, sprinkles({ gap: 's12' })].join(' ')}>
        <Select
          aria-label={t('interviewDialog.application')}
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        >
          <option value="">{t('interviewDialog.pickApplication')}</option>
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.company} {a.title}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t('interviewDialog.name')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="datetime-local"
          aria-label={t('interviewDialog.at')}
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        {applications.length === 0 ? (
          <span className={formRowHint}>{t('interviewDialog.needApplication')}</span>
        ) : null}
      </div>
    </Dialog>
  )
}

export default InterviewAddDialog
