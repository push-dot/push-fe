import { useState } from 'react'

import { useCalendar, useGoogleIntegration } from '../../entities/application'
import { Icon } from '../../shared/ui/icon'
import Toast, { useToast } from '../../shared/ui/toast'
import CalendarAddDialog from './calendar-add-dialog'
import CalendarDayCard from './calendar-day-card'
import CalendarGrid from './calendar-grid'
import { CALENDAR_COPY, EVENT_KINDS } from './constants'

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const CalendarPanel = () => {
  const [month, setMonth] = useState(() => monthStart(new Date()))
  const [picked, setPicked] = useState<Date | null>(null)
  const [adding, setAdding] = useState(false)
  const toast = useToast()
  const from = month.toISOString()
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString()
  const events = useCalendar(from, to, true)
  const google = useGoogleIntegration(true)
  const today = new Date()
  const inMonth = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth()
  const selected = picked ?? (inMonth ? today : month)
  const list = events.data?.data ?? []
  const move = (step: number) => {
    setPicked(null)
    setMonth(new Date(month.getFullYear(), month.getMonth() + step, 1))
  }
  const linked = google.data?.calendarStatus === 'CONNECTED'
  return (
    <>
      <div className="cal-bar">
        <div className="cal-nav">
          <button type="button" className="hbtn" aria-label={CALENDAR_COPY.prev} onClick={() => move(-1)}>
            <Icon name="back" size={22} />
          </button>
          <span className="h2 num">{`${month.getFullYear()}년 ${month.getMonth() + 1}월`}</span>
          <button type="button" className="hbtn" aria-label={CALENDAR_COPY.next} onClick={() => move(1)}>
            <Icon name="next" size={22} />
          </button>
        </div>
        <div className="cal-tools">
          {google.data ? (
            <span className="c1 t3 cal-google">
              <i className={linked ? 'cal-dot green' : 'cal-dot off'} />
              {linked ? CALENDAR_COPY.google.on : CALENDAR_COPY.google.off}
            </span>
          ) : null}
          <button type="button" className="btn pri sm" onClick={() => setAdding(true)}>
            <Icon name="plus" size={16} width={2.4} />
            {CALENDAR_COPY.add}
          </button>
        </div>
      </div>
      <div className="cal-legend">
        {EVENT_KINDS.map((kind) => (
          <span key={kind.key} className="c1 t2">
            <i className={`cal-dot ${kind.tone}`} />
            {kind.label}
          </span>
        ))}
      </div>
      <div className="cal-split">
        <CalendarGrid month={month} events={list} today={today} selected={selected} onPick={setPicked} />
        <CalendarDayCard day={selected} events={list} loaded={Boolean(events.data)} />
      </div>
      {adding ? (
        <CalendarAddDialog
          day={selected}
          onClose={() => setAdding(false)}
          onAdded={(day) => {
            setAdding(false)
            setMonth(monthStart(day))
            setPicked(day)
            toast.show(CALENDAR_COPY.added)
          }}
          onFailed={() => toast.show(CALENDAR_COPY.failed, { tone: 'err' })}
        />
      ) : null}
      <Toast message={toast.message} tone={toast.tone} action={toast.action} />
    </>
  )
}

export default CalendarPanel
