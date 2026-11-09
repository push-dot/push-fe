import type { CalendarEvent } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { calendarCreate } from '../../features/add-calendar-event'
import { Dialog } from '../../shared/ui/dialog'
import { Icon } from '../../shared/ui/icon'
import { CALENDAR_COPY, EVENT_KINDS } from './constants'
import { dateInput, dayChip, localStart, timeChip } from './lib'

const HOUR_MS = 3_600_000

type Props = { day: Date; onClose: () => void; onAdded: (day: Date) => void; onFailed: () => void }

const CalendarAddDialog = ({ day, onClose, onAdded, onFailed }: Props) => {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(() => dateInput(day))
  const [time, setTime] = useState<string>(CALENDAR_COPY.defaultTime)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<CalendarEvent['type']>('INTERVIEW')
  const start = localStart(date, time)
  const add = useMutation({
    mutationFn: () =>
      calendarCreate({
        type,
        title: title.trim(),
        startsAt: start.toISOString(),
        endsAt: new Date(start.getTime() + HOUR_MS).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['calendar'] })
      onAdded(start)
    },
    onError: onFailed,
  })
  const ready = title.trim().length > 0 && date.length > 0 && time.length > 0 && !add.isPending
  return (
    <Dialog label={CALENDAR_COPY.dialogTitle} onClose={onClose} className="cal-add">
      <div className="cal-add-head">
        <h2 className="h2">{CALENDAR_COPY.dialogTitle}</h2>
        <button type="button" className="hbtn cal-close" aria-label={CALENDAR_COPY.close} onClick={onClose}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <form
        className="cal-add-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) add.mutate()
        }}
      >
        <div className="cal-add-when">
          <label className="cal-field">
            <Icon name="calendar" size={20} className="t3" />
            <span className="num">{date ? dayChip(new Date(`${date}T00:00:00`)) : ''}</span>
            <input type="date" aria-label={CALENDAR_COPY.dateLabel} required value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className="cal-field">
            <Icon name="clock" size={20} className="t3" />
            <span className="num">{time ? timeChip(time) : ''}</span>
            <input type="time" aria-label={CALENDAR_COPY.timeLabel} required value={time} onChange={(event) => setTime(event.target.value)} />
          </label>
        </div>
        <input
          aria-label={CALENDAR_COPY.titleLabel}
          placeholder={CALENDAR_COPY.titleLabel}
          maxLength={300}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="cal-kinds" role="group" aria-label={CALENDAR_COPY.kindLabel}>
          {EVENT_KINDS.map((kind) => (
            <button key={kind.key} type="button" className="chip" aria-pressed={type === kind.key} onClick={() => setType(kind.key)}>
              <i className={`cal-dot ${kind.tone}`} />
              {kind.label}
            </button>
          ))}
        </div>
        <button type="submit" className="btn pri block" disabled={!ready}>
          {CALENDAR_COPY.submit}
        </button>
      </form>
    </Dialog>
  )
}

export default CalendarAddDialog
