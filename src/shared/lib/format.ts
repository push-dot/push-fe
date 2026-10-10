import i18n from '@/shared/i18n'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

const locale = (): string => i18n.language || 'ko'

const relative = (): Intl.RelativeTimeFormat =>
  new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' })

export const formatRelativeTime = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff) || diff < 0) return ''
  if (diff < HOUR_MS) return relative().format(-Math.max(1, Math.floor(diff / MINUTE_MS)), 'minute')
  if (diff < DAY_MS) return relative().format(-Math.floor(diff / HOUR_MS), 'hour')
  const days = Math.floor(diff / DAY_MS)
  if (days < 30) return relative().format(-days, 'day')
  return formatDate(iso)
}

export const formatDate = (iso: string): string =>
  new Intl.DateTimeFormat(locale(), { month: 'long', day: 'numeric' }).format(new Date(iso))

export const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat(locale(), {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))

export const dDayLabel = (isoDate: string): string => {
  const target = new Date(isoDate)
  const today = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(target) - startOfDay(today)) / DAY_MS)
  if (diffDays === 0) return 'D-DAY'
  if (diffDays > 0) return `D-${diffDays}`
  return `D+${Math.abs(diffDays)}`
}

export const monthLabel = (date: Date): string =>
  new Intl.DateTimeFormat(locale(), { year: 'numeric', month: 'long' }).format(date)
