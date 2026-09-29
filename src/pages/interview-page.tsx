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

const InterviewPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useInterviews()
  const { data: applications = [] } = useApplications()
  const [dialogOpen, setDialogOpen] = useState(false)

  const reflected = items.filter((s) => s.reflection)

  return (
    <>
      <CanvasHeader
        title="면접"
        actions={
          <Button variant="primary" size="sm" onClick={() => setDialogOpen(true)}>
            <Icon name="plus" size={20} /> 면접 준비
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
            message="아직 면접 준비가 없어요"
            actionLabel="면접 준비"
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
      <InterviewAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} applications={applications} />
    </>
  )
}

export default InterviewPage
