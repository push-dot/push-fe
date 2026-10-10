import { useState } from 'react'
import {
  Button,
  CanvasHeader,
  DataList,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonRows,
} from '@/shared/components'
import { useInterviews } from '@/features/interviews'
import { InterviewAddDialog, InterviewRow, ReflectionCard } from '@/features/interviews'
import { useApplications } from '@/features/applications'
import { useT } from '@/shared/i18n'

const InterviewPage = () => {
  const t = useT()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useInterviews()
  const { data: applications = [] } = useApplications()
  const [dialogOpen, setDialogOpen] = useState(false)

  const reflected = items.filter((s) => s.reflection)

  return (
    <>
      <CanvasHeader
        title={t('nav.interview')}
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> {t('interviews.add')}
          </Button>
        }
      />
      <div className="canvas-body">
        {isPending ? (
          <DataList>
            <SkeletonRows count={3} height={52} />
          </DataList>
        ) : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? (
          <EmptyState
            message={t('interviews.empty')}
            actionLabel={t('interviews.add')}
            onAction={() => setDialogOpen(true)}
          />
        ) : null}
        {isSuccess && items.length > 0 ? (
          <>
            <DataList>
              {items.map((session) => (
                <InterviewRow key={session.id} session={session} />
              ))}
            </DataList>
            {reflected.map((session) => (
              <ReflectionCard key={session.id} session={session} />
            ))}
          </>
        ) : null}
      </div>
      <InterviewAddDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        applications={applications}
      />
    </>
  )
}

export default InterviewPage
