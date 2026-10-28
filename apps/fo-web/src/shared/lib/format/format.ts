import { JOB_CATEGORIES, type Career, type JobCategory } from '@push/api-client'

const DAY = 86_400_000
const localDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

export const dDay = (deadline: string | null, today = new Date()): string | null => {
  if (!deadline) return null
  const [y, m, d] = deadline.slice(0, 10).split('-').map(Number)
  const diff = Math.round((Date.UTC(y!, m! - 1, d!) - localDay(today)) / DAY)
  return diff < 0 ? '마감' : diff === 0 ? 'D-day' : `D-${diff}`
}

const ym = (iso: string) => `${Number(iso.slice(0, 4))}년 ${Number(iso.slice(5, 7))}월`

export const periodLabel = (c: Pick<Career, 'startedOn' | 'endedOn'>) =>
  `${ym(c.startedOn)} – ${c.endedOn ? ym(c.endedOn) : '현재'}`

export const roleLabel = (category: JobCategory | null, years: number | null) =>
  [category && (JOB_CATEGORIES.find((c) => c.key === category)?.label ?? category), years == null ? null : `${years}년차`]
    .filter(Boolean)
    .join(' · ')

export const initials = (name: string) => ([...name].length >= 3 ? [...name].slice(-2).join('') : name)

const BRAND = ['#1F3A8A', '#0E7A5F', '#7A2E8C', '#B4501E', '#1B6E8F', '#5B4CF0', '#8C2F39']
export const brandOf = (name: string) => BRAND[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % BRAND.length]!

export const relativeTime = (iso: string, now = Date.now()) => {
  const delta = now - new Date(iso).getTime()
  const minute = Math.floor(delta / 60000)
  if (minute < 1) return '방금'
  if (minute < 60) return `${minute}분 전`
  const hour = Math.floor(minute / 60)
  if (hour < 24) return `${hour}시간 전`
  const day = Math.floor(hour / 24)
  if (day === 1) return '어제'
  if (day < 7) return `${day}일 전`
  const date = new Date(iso)
  return `${date.getMonth() + 1}월 ${date.getDate()}일`
}

export const compactCount = (count: number) => {
  if (count < 1000) return String(count)
  const value = count / 1000
  const text = value >= 10 ? String(Math.round(value)) : String(Math.round(value * 10) / 10)
  return `${text}천`
}

export const clockLabel = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
