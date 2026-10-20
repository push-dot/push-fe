import { CAREER_STATUSES, JOB_CATEGORIES, TENURES, type CareerStatus, type JobCategory, type Tenure } from '@push/api-client'

/** Sheet-owned filters; 직군 chips live on the screen itself. */
export type SheetFilters = { tenure: Tenure[]; status: CareerStatus[]; explore: 'recommended' | 'offers' }

export const EMPTY_SHEET: SheetFilters = { tenure: [], status: [], explore: 'recommended' }

export const tenureOf = (years: number): Tenure => (years <= 2 ? '0-2' : years <= 5 ? '3-5' : years <= 9 ? '6-9' : '10+')

// 추천 is the default view, so only tenure/status/제안 count toward the badge (board: "필터 2개 적용됨").
export const appliedCount = (f: SheetFilters) => f.tenure.length + f.status.length + (f.explore === 'offers' ? 1 : 0)

/** "3–5년 · 이직/구직중" subtitle in label order. */
export const filterSummary = (f: SheetFilters) =>
  [...TENURES.filter((t) => f.tenure.includes(t.key)), ...CAREER_STATUSES.filter((s) => f.status.includes(s.key))]
    .map((x) => x.label)
    .join(' · ')

export const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

const label = <K extends string>(list: { key: K; label: string }[], k: K) => list.find((x) => x.key === k)?.label ?? k

export const categoryLabel = (k: JobCategory) => label(JOB_CATEGORIES, k)
export const statusLabel = (k: CareerStatus) => label(CAREER_STATUSES, k)

/** "개발 · 5년차" */
export const careerLine = (p: { jobCategory: JobCategory; tenureYears: number }) =>
  `${categoryLabel(p.jobCategory)} · ${p.tenureYears === 0 ? '신입' : `${p.tenureYears}년차`}`

/** Avatar initials: given name for 3-syllable Korean names (김태윤 → 태윤). */
export const givenName = (name: string) => (name.length === 3 ? name.slice(1) : name.slice(0, 2))
