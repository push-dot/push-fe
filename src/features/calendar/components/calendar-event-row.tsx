import { dDayLabel, formatDate } from '@/shared/lib/format'
import { DataListRow, StatusChip } from '@/shared/components'
import type { CalendarEvent } from '../api/schemas'

const TYPE_LABELS: Record<string, string> = {
  INTERVIEW: '면접',
  DEADLINE: '마감',
  FOLLOW_UP: '후속',
  CUSTOM: '일정',
}

const CalendarEventRow = ({ event }: { event: CalendarEvent }) => {
  const dday = dDayLabel(event.startsAt)
  return (
    <DataListRow
      title={event.title}
      meta={`${formatDate(event.startsAt)} · ${TYPE_LABELS[event.type]}`}
      trailing={<StatusChip tone={dday === 'D-DAY' ? 'error' : 'ready'} label={dday} />}
    />
  )
}

export default CalendarEventRow
