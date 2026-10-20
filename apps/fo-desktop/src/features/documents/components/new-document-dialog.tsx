import { useState } from 'react'
import { form, formRowHint, sprinkles } from '@push/design-system'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'
import type { DocumentKind } from '../api/schemas'
import { Button, Dialog, Input, Select, showToast } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import type { Application } from '@/features/applications'
import { useCreateDocument } from '../api/hooks'

const KIND_OPTIONS: { value: DocumentKind; labelKey: MsgKey }[] = [
  { value: 'RESUME', labelKey: 'docDialog.kindResume' },
  { value: 'COVER_LETTER', labelKey: 'docDialog.kindCoverLetter' },
  { value: 'PORTFOLIO', labelKey: 'docDialog.kindPortfolio' },
]

type NewDocumentDialogProps = {
  open: boolean
  onClose: () => void
  applications: Pick<Application, 'id' | 'company' | 'title'>[]
}

const NewDocumentDialog = ({ open, onClose, applications }: NewDocumentDialogProps) => {
  const t = useT()
  const navigate = useNavigate()
  const create = useCreateDocument()
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<DocumentKind>('RESUME')
  const [applicationId, setApplicationId] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!title.trim() || !applicationId) return
    setBusy(true)
    try {
      const doc = await create.mutateAsync({
        applicationId,
        title: title.trim(),
        kind,
        template: 'CLASSIC',
      })
      onClose()
      navigate(ROUTES.document(doc.id))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('docDialog.createFailed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={t('docDialog.new')}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('docDialog.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={busy}
            disabled={!title.trim() || !applicationId}
            onClick={() => void submit()}
          >
            {t('docDialog.create')}
          </Button>
        </>
      }
    >
      <div className={[form, sprinkles({ gap: 's12' })].join(' ')}>
        <Input
          placeholder={t('docDialog.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Select
          aria-label={t('docDialog.kind')}
          value={kind}
          onChange={(e) => setKind(e.target.value as DocumentKind)}
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </Select>
        <Select
          aria-label={t('docDialog.application')}
          value={applicationId}
          onChange={(e) => setApplicationId(e.target.value)}
        >
          <option value="">{t('docDialog.pickApplication')}</option>
          {applications.map((a) => (
            <option key={a.id} value={a.id}>
              {a.company} {a.title}
            </option>
          ))}
        </Select>
        {applications.length === 0 ? (
          <span className={formRowHint}>{t('docDialog.needApplication')}</span>
        ) : null}
      </div>
    </Dialog>
  )
}

export default NewDocumentDialog
