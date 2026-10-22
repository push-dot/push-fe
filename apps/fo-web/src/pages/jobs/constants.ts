import type { CareerYears, EmploymentType, JobCategory } from '@push/api-client'

export const JOB_SORTS = ['latest', 'deadline', 'popular'] as const

export type JobSort = (typeof JOB_SORTS)[number]

export const SORT_LABEL: Record<JobSort, string> = {
  latest: '최신순',
  deadline: '마감 임박',
  popular: '많이 본',
}

export const SKILL_OPTIONS = ['Kotlin', 'Java', 'Spring', 'React', 'TypeScript', 'Python', 'AWS'] as const

export const JOB_PAGE_SIZE = 4

export const FILTER_CHIPS = [
  { key: 'category', label: '직군' },
  { key: 'skills', label: '기술 스택' },
  { key: 'career', label: '경력' },
  { key: 'location', label: '지역' },
  { key: 'employment', label: '고용형태' },
] as const

export type FilterKey = (typeof FILTER_CHIPS)[number]['key']

export type JobFilters = {
  category: JobCategory[]
  skills: string[]
  careerYears: CareerYears[]
  location: string[]
  employmentType: EmploymentType[]
}

export const EMPTY_FILTERS: JobFilters = {
  category: [],
  skills: [],
  careerYears: [],
  location: [],
  employmentType: [],
}
