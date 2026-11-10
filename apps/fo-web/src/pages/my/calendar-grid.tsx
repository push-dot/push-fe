import type { CalendarEvent } from '@push/api-client'

import { CALENDAR_WEEKDAYS } from './constants'
import { eventsOn, eventTone, monthCells, sameDay } from './lib'

type Props = { month: Date; events: CalendarEvent[]; today: Date; selected: Date; onPick: (day: Date) => void }

const CalendarGrid = ({ month, events, today, selected, onPick }: Props) => {
  const { lead, days, trail } = monthCells(month)
  return (
    <div className="box cal-grid">
      {CALENDAR_WEEKDAYS.map((label, index) => (
        <span key={label} className={index === 0 ? 'cal-wd c1 w7 sun' : 'cal-wd c1 w7 t3'}>
          {label}
        </span>
      ))}
      {Array.from({ length: lead }, (_, index) => (
        <span key={`lead-${index}`} className="cal-cell pad" />
      ))}
      {Array.from({ length: days }, (_, index) => {
        const day = new Date(month.getFullYear(), month.getMonth(), index + 1)
        const top = eventsOn(events, day)[0]
        const isToday = sameDay(day, today)
        const classes = ['cal-cell', sameDay(day, selected) ? 'on' : ''].filter(Boolean).join(' ')
        return (
          <button key={index} type="button" className={classes} aria-pressed={sameDay(day, selected)} onClick={() => onPick(day)}>
            <span className={['c1 w7 num cal-num', isToday ? 'today' : '', day.getDay() === 0 ? 'sun' : ''].filter(Boolean).join(' ')}>{index + 1}</span>
            {top ? <span className={`c2 w7 cap cal-chip ${eventTone(top.type)}`}>{top.title}</span> : null}
          </button>
        )
      })}
      {Array.from({ length: trail }, (_, index) => (
        <span key={`trail-${index}`} className="cal-cell pad" />
      ))}
    </div>
  )
}

export default CalendarGrid
