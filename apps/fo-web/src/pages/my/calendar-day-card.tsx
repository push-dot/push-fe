import type { CalendarEvent } from '@push/api-client'

import { clockLabel } from '../../shared/lib/format'
import { CALENDAR_EMPTY } from './constants'
import { dayTitle, eventsOn, eventTone } from './lib'

const CalendarDayCard = ({ day, events, loaded }: { day: Date; events: CalendarEvent[]; loaded: boolean }) => {
  const onDay = eventsOn(events, day)
  return (
    <section className="card cal-day" aria-live="polite">
      <h2 className="b1 w7">{dayTitle(day)}</h2>
      {loaded && onDay.length === 0 ? <p className="b2 t3 cal-none">{CALENDAR_EMPTY}</p> : null}
      {onDay.map((event) => (
        <div key={event.id} className="cal-event">
          <i className={`cal-bar-tone ${eventTone(event.type)}`} />
          <span>
            <span className="b2 w7">{event.title}</span>
            <span className="c1 t3">{[clockLabel(event.startsAt), event.location].filter(Boolean).join(' · ')}</span>
          </span>
        </div>
      ))}
    </section>
  )
}

export default CalendarDayCard
