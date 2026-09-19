import { useState } from 'react'
import { dDayLabel, formatDate, monthLabel } from '@/shared/lib/format'
import {
  Button,
  CanvasHeader,
  Card,
  DataList,
  DataListRow,
  EmptyState,
  ErrorState,
  Icon,
  Skeleton,
  StatusChip,
  showToast,
} from '@/shared/components'
import { useCalendarEvents, useSyncGoogle } from '@/features/calendar'

const TYPE_LABELS: Record<string, string> = {
  INTERVIEW: '면접',
  DEADLINE: '마감',
  FOLLOW_UP: '후속',
  CUSTOM: '일정',
}

const CalendarPage = () => {
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCalendarEvents()
  const syncMutation = useSyncGoogle()

  const onSync = async () => {
    try {
      await syncMutation.mutateAsync()
      showToast('동기화를 시작했어요', 'check')
    } catch (e) {
      showToast(e instanceof Error ? e.message : '동기화하지 못했어요', 'circle-alert')
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
          <Button
            variant="primary"
            size="sm"
            loading={syncMutation.isPending}
            onClick={() => void onSync()}
          >
            <Icon name="calendar" size={20} /> 동기화
          </Button>
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
              {upcoming.map((event) => {
                const dday = dDayLabel(event.startsAt)
                return (
                  <DataListRow
                    key={event.id}
                    title={event.title}
                    meta={`${formatDate(event.startsAt)} · ${TYPE_LABELS[event.type]}`}
                    trailing={
                      <StatusChip tone={dday === 'D-DAY' ? 'error' : 'ready'} label={dday} />
                    }
                  />
                )
              })}
            </DataList>
          </>
        ) : null}
      </div>
    </>
  )
}

export default CalendarPage
