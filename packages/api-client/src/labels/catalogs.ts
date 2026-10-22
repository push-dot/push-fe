import { HUB_CATEGORY_COUNT } from '../constants'
import type { CareerStatus, CareerYears, EmploymentType, JobCategory, PostCategory, Tenure } from '../types'

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

export const HUB_CATEGORIES = JOB_CATEGORIES.slice(0, HUB_CATEGORY_COUNT)

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
