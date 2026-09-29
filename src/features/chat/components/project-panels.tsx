import { useT } from '@/shared/i18n'
import { Card, Icon, StatusChip } from '@/shared/components'
import type { StatusChipTone } from '@/shared/components'
import { cardMeta } from '@push/design-system'
import { useProjectPanels } from '../api/hooks'
import type { CliRunState } from '../api/schemas'

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
  const { data } = useProjectPanels(projectId)
  const runs = data?.runs ?? []
  const evidence = data?.evidence ?? []

  return (
    <>
      {runs.map((run) => (
        <Card key={run.id} title={t('chat.running')}>
          <StatusChip
            tone={RUN_TONES[run.state]}
            label={run.state}
            icon={run.state === 'RUNNING' ? <Icon name="loader-circle" size={16} /> : undefined}
          />
          <div className={cardMeta}>
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
          {item.summary ? <div className={cardMeta}>{item.summary}</div> : null}
        </Card>
      ))}
    </>
  )
}

export default ProjectPanels
