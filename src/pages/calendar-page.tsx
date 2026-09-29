import { useState } from 'react'
import { formatDate, monthLabel } from '@/shared/lib/format'
import {
  Button,
  CanvasHeader,
  Card,
  DataList,
  EmptyState,
  ErrorState,
  Icon,
  Skeleton,
  showToast,
} from '@/shared/components'
import {
  CalendarEventRow,
  useCalendarEvents,
  useConnectGoogle,
  useGoogleStatus,
  useSyncGoogle,
} from '@/features/calendar'

const CalendarPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCalendarEvents()
  const google = useGoogleStatus()
  const syncMutation = useSyncGoogle()
  const connectMutation = useConnectGoogle()

  const onSync = async () => {
    try {
      await syncMutation.mutateAsync()
      showToast('동기화를 시작했어요', 'check')
    } catch (e) {
      showToast(e instanceof Error ? e.message : '동기화하지 못했어요', 'circle-alert')
    }
  }

  const onConnect = async () => {
    try {
      window.location.href = await connectMutation.mutateAsync()
    } catch (e) {
      showToast(e instanceof Error ? e.message : '연결하지 못했어요', 'circle-alert')
    }
  }

  const [now] = useState(() => Date.now())

  const upcoming = [...items]
    .filter((e) => new Date(e.endsAt).getTime() >= now - 86_400_000)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  const monthSummary = upcoming
    .slice(0, 5)
    .map((e) => `${formatDate(e.startsAt)} ${e.title}`)
    .join(' · ')

  return (
    <>
      <CanvasHeader
        title="캘린더"
        actions={
          google.data && !google.data.connected ? (
            <Button variant="primary" size="sm" onClick={() => void onConnect()}>
              <Icon name="calendar" size={20} /> Google 연결
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={syncMutation.isPending}
              onClick={() => void onSync()}
            >
              <Icon name="calendar" size={20} /> 동기화
            </Button>
          )
        }
      />
      <div className="canvas-body">
        {isPending ? (
          <>
            <Skeleton height={96} />
            <Skeleton height={52} />
            <Skeleton height={52} />
          </>
        ) : null}
        {isError ? <ErrorState message={error?.message} onRetry={() => void refetch()} /> : null}
        {isSuccess && items.length === 0 ? <EmptyState message="다가오는 일정이 없어요" /> : null}
        {isSuccess && items.length > 0 ? (
          <>
            <Card title={monthLabel(new Date())}>
              <p className="t-body-sm">{monthSummary}</p>
            </Card>
            <DataList>
              {upcoming.map((event) => (
                <CalendarEventRow key={event.id} event={event} />
              ))}
            </DataList>
          </>
        ) : null}
      </div>
    </>
  )
}

export default CalendarPage
