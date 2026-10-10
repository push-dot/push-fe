import { dDayLabel, formatDate } from '@/shared/lib/format'
import { DataListRow, StatusChip } from '@/shared/components'
import { useT } from '@/shared/i18n'
import type { MsgKey } from '@/shared/i18n'
import type { CalendarEvent } from '../api/schemas'

const TYPE_LABEL_KEYS: Record<string, MsgKey> = {
  INTERVIEW: 'calendar.types.INTERVIEW',
  DEADLINE: 'calendar.types.DEADLINE',
  FOLLOW_UP: 'calendar.types.FOLLOW_UP',
  CUSTOM: 'calendar.types.CUSTOM',
}

const CalendarEventRow = ({ event }: { event: CalendarEvent }) => {
  const t = useT()
  const dday = dDayLabel(event.startsAt)
  return (
    <DataListRow
      title={event.title}
      meta={`${formatDate(event.startsAt)} · ${t(TYPE_LABEL_KEYS[event.type] ?? 'calendar.types.CUSTOM')}`}
      trailing={<StatusChip tone={dday === 'D-DAY' ? 'error' : 'ready'} label={dday} />}
    />
  )
}

export default CalendarEventRow
