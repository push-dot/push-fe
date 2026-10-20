import { JOB_CATEGORIES, type Career, type JobCategory } from '@push/api-client'

const DAY = 86_400_000
const localDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

/** "D-13", "D-day", "마감"; null when there is no deadline. */
export const dDay = (deadline: string | null, today = new Date()): string | null => {
  if (!deadline) return null
  const [y, m, d] = deadline.slice(0, 10).split('-').map(Number)
  const diff = Math.round((Date.UTC(y!, m! - 1, d!) - localDay(today)) / DAY)
  return diff < 0 ? '마감' : diff === 0 ? 'D-day' : `D-${diff}`
}

/** "경력 4–6년", "경력 7년+", "신입". */
export const careerLabel = (min: number, max: number | null) =>
  min === 0 && !max ? '신입' : max ? `경력 ${min}–${max}년` : `경력 ${min}년+`

const ym = (iso: string) => `${Number(iso.slice(0, 4))}년 ${Number(iso.slice(5, 7))}월`

/** "2023년 3월 – 현재" */
export const periodLabel = (c: Pick<Career, 'startedOn' | 'endedOn'>) =>
  `${ym(c.startedOn)} – ${c.endedOn ? ym(c.endedOn) : '현재'}`

/** "개발 · 4년차" */
export const roleLabel = (category: JobCategory, years: number) =>
  `${JOB_CATEGORIES.find((c) => c.key === category)?.label ?? category} · ${years}년차`

/** Avatar initials: given name for 3+ syllable Korean names ("이하은" → "하은"). */
export const initials = (name: string) => ([...name].length >= 3 ? [...name].slice(-2).join('') : name)

// Same placeholder palette as the mobile JobCard so logos match across app and web.
const BRAND = ['#1F3A8A', '#0E7A5F', '#7A2E8C', '#B4501E', '#1B6E8F', '#5B4CF0', '#8C2F39']
export const brandOf = (name: string) => BRAND[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % BRAND.length]!
