import type { CalendarEvent } from '@push/api-client'

import { CALENDAR_WEEKDAYS, EVENT_KINDS } from '../constants'

export const monthCells = (month: Date) => {
  const lead = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  return { lead, days, trail: (7 - ((lead + days) % 7)) % 7 }
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const rank = (event: Pick<CalendarEvent, 'type'>) => EVENT_KINDS.findIndex((kind) => kind.key === event.type)

export const eventsOn = <T extends Pick<CalendarEvent, 'type' | 'startsAt'>>(events: T[], day: Date) =>
  events
    .filter((event) => sameDay(new Date(event.startsAt), day))
    .sort((a, b) => rank(a) - rank(b) || a.startsAt.localeCompare(b.startsAt))

export const eventTone = (type: CalendarEvent['type']) => EVENT_KINDS.find((kind) => kind.key === type)?.tone ?? 'ac'

export const dayTitle = (day: Date) => `${day.getMonth() + 1}월 ${day.getDate()}일 ${CALENDAR_WEEKDAYS[day.getDay()]}요일`

export const dayChip = (day: Date) => `${day.getMonth() + 1}월 ${day.getDate()}일 (${CALENDAR_WEEKDAYS[day.getDay()]})`

export const timeChip = (hhmm: string) => {
  const [hour = 0, minute = 0] = hhmm.split(':').map(Number)
  return `${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}:${String(minute).padStart(2, '0')}`
}

export const dateInput = (day: Date) =>
  `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`

export const localStart = (date: string, time: string) => new Date(`${date}T${time}:00`)
