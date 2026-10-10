import { useState } from 'react'
import { sprinkles } from '@push/design-system'
import type { FormEvent } from 'react'
import type { JobPosting } from '../api/schemas'
import { useCreateJob } from '../api/hooks'
import { Button, Dialog, Input, Select, Textarea, showToast } from '@/shared/components'
import { useT } from '@/shared/i18n'
import { isHttpUrl } from '@/shared/lib/url'

type JobAddDialogProps = {
  open: boolean
  onClose: () => void
  onCreated?: (job: JobPosting) => void
  initialSource?: string
}

const JobAddDialog = ({ open, onClose, onCreated, initialSource = '' }: JobAddDialogProps) => {
  const t = useT()
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [source, setSource] = useState(initialSource)
  const create = useCreateJob()

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!company.trim() || !title.trim() || !source.trim()) return
    try {
      const url = isHttpUrl(source)
      const job = await create.mutateAsync({
        company: company.trim(),
        title: title.trim(),
        sourceKind: url ? 'URL' : 'TEXT',
        ...(url ? { sourceUrl: source.trim() } : {}),
        sourceText: url ? '' : source.trim(),
        requirements: [],
        preferred: [],
      })
      showToast(t('jobs.added'))
      onCreated?.(job)
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('jobs.addFailed'), 'circle-alert')
    }
  }

  return (
    <Dialog
      open={open}
      title={t('jobs.addTitle')}
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={create.isPending}
            onClick={(e) => void submit(e)}
          >
            {t('common.add')}
          </Button>
        </>
      }
    >
      <form
        className={['form', sprinkles({ gap: 's12' })].join(' ')}
        onSubmit={(e) => void submit(e)}
      >
        <Input
          placeholder={t('jobs.company')}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
        <Input
          placeholder={t('jobs.jobTitle')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Select
          value={isHttpUrl(source) ? 'URL' : 'TEXT'}
          onChange={() => undefined}
          aria-label={t('jobs.sourceKind')}
          className={sprinkles({ display: 'none' })}
        />
        <Textarea
          placeholder={t('jobs.sourcePlaceholder')}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={4}
          required
        />
      </form>
    </Dialog>
  )
}

export default JobAddDialog
