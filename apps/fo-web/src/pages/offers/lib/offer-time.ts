import { relativeTime } from '../../../shared/lib/format'

const DAY = 86_400_000
const WEEK_DAYS = 7

const dayStart = (ms: number) => {
  const date = new Date(ms)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

const dayGap = (iso: string, now: number) => Math.round((dayStart(now) - dayStart(Date.parse(iso))) / DAY)

export const dateLabel = (iso: string) => {
  const date = new Date(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export const listTime = (iso: string, now = Date.now()) => {
  const gap = dayGap(iso, now)
  if (gap <= 0) return relativeTime(iso, now)
  if (gap === 1) return '어제'
  return gap < WEEK_DAYS ? `${gap}일 전` : dateLabel(iso)
}

export const dividerLabel = (iso: string, now = Date.now()) => (dayGap(iso, now) === 1 ? '어제' : dateLabel(iso))

export const isNewDay = (iso: string, previous: string | undefined) => !previous || dayStart(Date.parse(iso)) !== dayStart(Date.parse(previous))
