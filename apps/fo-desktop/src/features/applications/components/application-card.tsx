import { Card, Button, StatusChip } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import type { Application } from '../api/schemas'
import { stageChipTone } from '../lib/application-chip'

const STAGE_KEYS: Record<string, MsgKey> = {
  DISCOVERED: 'applications.stages.DISCOVERED',
  PREPARING: 'applications.stages.PREPARING',
  READY: 'applications.stages.READY',
  APPLIED: 'applications.stages.APPLIED',
  SCREENING: 'applications.stages.SCREENING',
  INTERVIEW: 'applications.stages.INTERVIEW',
  OFFER: 'applications.stages.OFFER',
  ACCEPTED: 'applications.stages.ACCEPTED',
  REJECTED: 'applications.stages.REJECTED',
  WITHDRAWN: 'applications.stages.WITHDRAWN',
}

type ApplicationCardProps = {
  application: Application
  running: boolean
  onOpen: () => void
  onRun: () => void
}

const ApplicationCard = ({ application, running, onOpen, onRun }: ApplicationCardProps) => {
  const t = useT()
  return (
    <Card
      title={`${application.company} ${application.title}`}
      meta={t(STAGE_KEYS[application.stage] ?? 'applications.stages.DISCOVERED')}
      onClick={onOpen}
    >
      <StatusChip tone={stageChipTone(application.stage)} label={application.stage} />
      <Button
        variant="ghost"
        size="sm"
        disabled={running}
        onClick={(e) => {
          e.stopPropagation()
          onRun()
        }}
      >
        {running ? t('applications.generating') : t('applications.generateResume')}
      </Button>
    </Card>
  )
}

export default ApplicationCard
