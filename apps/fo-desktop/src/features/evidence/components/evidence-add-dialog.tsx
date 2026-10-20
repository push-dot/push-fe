import { useState } from 'react'
import { sprinkles } from '@push/design-system'
import type { EvidenceKind } from '../api/schemas'
import { Button, Dialog, Input, Select, Textarea, showToast } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import { useCreateEvidence } from '../api/hooks'

const KIND_OPTIONS: { value: EvidenceKind; labelKey: MsgKey }[] = [
  { value: 'CAREER', labelKey: 'evidence.kinds.CAREER' },
  { value: 'PROJECT', labelKey: 'evidence.kinds.PROJECT' },
  { value: 'RESUME', labelKey: 'evidence.kinds.RESUME' },
  { value: 'GITHUB', labelKey: 'evidence.kinds.GITHUB' },
  { value: 'EDUCATION', labelKey: 'evidence.kinds.EDUCATION' },
  { value: 'SKILL', labelKey: 'evidence.kinds.SKILL' },
]

type EvidenceAddDialogProps = {
  open: boolean
  onClose: () => void
}

const EvidenceAddDialog = ({ open, onClose }: EvidenceAddDialogProps) => {
  const t = useT()
  const create = useCreateEvidence()
  const [kind, setKind] = useState<EvidenceKind>('CAREER')
  const [title, setTitle] = useState('')
  const [sourceText, setSourceText] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!title.trim() || !sourceText.trim()) return
    setBusy(true)
    try {
      await create.mutateAsync({
        kind,
        title: title.trim(),
        sourceText: sourceText.trim(),
        ...(sourceUrl.trim() ? { sourceUrl: sourceUrl.trim() } : {}),
      })
      showToast(t('evidence.added'), 'check')
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('evidence.addFailed'), 'circle-alert')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      title={t('evidence.title')}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={busy}
            disabled={!title.trim() || !sourceText.trim()}
            onClick={() => void submit()}
          >
            {t('common.add')}
          </Button>
        </>
      }
    >
      <div className={['form', sprinkles({ gap: 's12' })].join(' ')}>
        <Select
          aria-label={t('evidence.kind')}
          value={kind}
          onChange={(e) => setKind(e.target.value as EvidenceKind)}
        >
          {KIND_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.labelKey)}
            </option>
          ))}
        </Select>
        <Input
          placeholder={t('evidence.placeholderTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Textarea
          placeholder={t('evidence.placeholderText')}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={5}
        />
        <Input
          placeholder={t('evidence.placeholderUrl')}
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </div>
    </Dialog>
  )
}

export default EvidenceAddDialog
