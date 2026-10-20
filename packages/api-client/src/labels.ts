import type { CareerStatus, CareerYears, EmploymentType, JobCategory, PostCategory, Tenure, ApplicationStage } from './types'

// Order matches the Claude Design filter sheets.
export const JOB_CATEGORIES: { key: JobCategory; label: string }[] = [
  { key: 'dev', label: '개발' },
  { key: 'data', label: '데이터' },
  { key: 'design', label: '디자인' },
  { key: 'plan', label: '기획' },
  { key: 'marketing', label: '마케팅' },
  { key: 'sales', label: '영업' },
  { key: 'hr', label: '인사' },
  { key: 'ops', label: '경영지원' },
]

// Hub toggle chips use the first six.
export const HUB_CATEGORIES = JOB_CATEGORIES.slice(0, 6)

export const CAREER_YEARS: { key: CareerYears; label: string }[] = [
  { key: '0', label: '신입' },
  { key: '1-3', label: '1–3년' },
  { key: '4-6', label: '4–6년' },
  { key: '7-9', label: '7–9년' },
  { key: '10+', label: '10년+' },
]

export const EMPLOYMENT_TYPES: { key: EmploymentType; label: string }[] = [
  { key: 'full_time', label: '정규직' },
  { key: 'contract', label: '계약직' },
  { key: 'intern', label: '인턴' },
  { key: 'freelance', label: '프리랜서' },
  { key: 'dispatch', label: '파견' },
]

export const TENURES: { key: Tenure; label: string }[] = [
  { key: '0-2', label: '0–2년' },
  { key: '3-5', label: '3–5년' },
  { key: '6-9', label: '6–9년' },
  { key: '10+', label: '10년+' },
]

export const CAREER_STATUSES: { key: CareerStatus; label: string }[] = [
  { key: 'satisfied', label: '만족' },
  { key: 'seeking', label: '이직/구직중' },
  { key: 'feedback', label: '프로필 피드백' },
]

export const POST_CATEGORIES: { key: PostCategory | null; label: string }[] = [
  { key: null, label: '전체' },
  { key: 'work', label: '직장 생활' },
  { key: 'dev', label: '개발' },
  { key: 'daily', label: '일상' },
  { key: 'career', label: '커리어' },
  { key: 'talk', label: '소통' },
  { key: 'coffeechat', label: '커피챗' },
  { key: 'marketing', label: '마케팅·광고' },
]

// User-facing badge for application stages (마이 › 내 활동 › 지원활동).
export const stageBadge = (stage: ApplicationStage): string => {
  switch (stage) {
    case 'APPLIED':
      return '지원함'
    case 'SCREENING':
      return '서류'
    case 'INTERVIEW':
      return '면접'
    case 'OFFER':
    case 'ACCEPTED':
      return '합격'
    // shortcut: design has only 5 badges, WITHDRAWN shares 불합격; add a 지원 취소 badge if design adds one
    case 'REJECTED':
    case 'WITHDRAWN':
      return '불합격'
    default:
      return '준비 중'
  }
}

/** "개발 외 1" style chip label for multi-select filters. */
export const chipLabel = (fallback: string, selected: string[]): string =>
  selected.length === 0 ? fallback : selected.length === 1 ? selected[0]! : `${selected[0]} 외 ${selected.length - 1}`

/** 근무 조건 rows from push-be's free-form workConditions object ("근무 · 주 5일"). Arrays of strings pass through. */
export const workConditionLines = (w: unknown): string[] => {
  if (Array.isArray(w)) return w.map(String)
  if (!w || typeof w !== 'object') return []
  return Object.entries(w).flatMap(([k, v]) => {
    const text = Array.isArray(v) ? v.join(', ') : v == null || typeof v === 'object' ? '' : String(v)
    return text ? [`${k} · ${text}`] : []
  })
}

/** push-be serves images as "/api/v1/uploads/images/…"; native Image and other origins need it absolute. */
export const absoluteUrl = (url: string | null | undefined, apiBaseUrl: string): string | null =>
  !url ? null : url.startsWith('/') ? new URL(url, apiBaseUrl).href : url
