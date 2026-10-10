import { useState } from 'react'
import { formatDate, monthLabel } from '@/shared/lib/format'
import { openExternal } from '@/shared/lib/open-external'
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
import { useT } from '@/shared/i18n'

const CalendarPage = () => {
  const t = useT()
  const { data: items = [], isPending, isError, isSuccess, error, refetch } = useCalendarEvents()
  const google = useGoogleStatus()
  const syncMutation = useSyncGoogle()
  const connectMutation = useConnectGoogle()

  const onSync = async () => {
    try {
      await syncMutation.mutateAsync()
      showToast(t('calendar.syncStarted'), 'check')
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('calendar.syncFailed'), 'circle-alert')
    }
  }

  const onConnect = async () => {
    try {
      const url = await connectMutation.mutateAsync()
      if ('__TAURI_INTERNALS__' in window) {
        await openExternal(url)
      } else {
        window.location.href = url
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : t('calendar.connectFailed'), 'circle-alert')
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
        title={t('nav.calendar')}
        actions={
          google.data && !google.data.connected ? (
            <Button variant="primary" size="sm" onClick={() => void onConnect()}>
              <Icon name="calendar" size={20} /> {t('calendar.connect')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              loading={syncMutation.isPending}
              onClick={() => void onSync()}
            >
              <Icon name="calendar" size={20} /> {t('calendar.sync')}
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
        {isSuccess && items.length === 0 ? <EmptyState message={t('calendar.empty')} /> : null}
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
