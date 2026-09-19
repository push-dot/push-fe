import { useState } from 'react'
import { formatDateTime } from '@/shared/lib/format'
import {
  Button,
  CanvasHeader,
  Card,
  DataList,
  DataListRow,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonRows,
} from '@/shared/components'
import { useInterviews } from '@/features/interviews'
import { InterviewAddDialog } from '@/features/interviews'

const InterviewPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useInterviews()
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
        {isError ? (
          <ErrorState message={error?.message} onRetry={() => void refetch()} />
        ) : null}
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
                <DataListRow
                  key={session.id}
                  title={session.title}
                  meta={`${formatDateTime(session.scheduledAt)}${session.durationMinutes ? ` · ${session.durationMinutes}분` : ''}`}
                />
              ))}
            </DataList>
            {reflected.map((session) => (
              <Card key={session.id} title={`회고 — ${session.title}`}>
                <p className="t-body-sm">{session.reflection}</p>
              </Card>
            ))}
          </>
        ) : null}
      </div>
      <InterviewAddDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  )
}

export default InterviewPage
