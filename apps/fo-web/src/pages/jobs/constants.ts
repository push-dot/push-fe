import type { CareerYears, EmploymentType, JobCategory } from '@push/api-client'

export const JOB_SORTS = ['latest', 'deadline', 'popular'] as const

export type JobSort = (typeof JOB_SORTS)[number]

export const SORT_LABEL: Record<JobSort, string> = {
  latest: '최신순',
  deadline: '마감 임박순',
  popular: '인기순',
}

export const SKILL_OPTIONS = ['Kotlin', 'Java', 'Spring Boot', 'Go', 'React', 'Python'] as const

export const JOB_PAGE_SIZE = 12
export const FILTERED_EMPTY = '조건에 맞는 공고가 없어요.'
export const FILTERED_EMPTY_HINT = '필터를 줄여 보세요.'
export const LOADING_MORE = '공고를 더 불러오는 중'
export const SKILL_SEARCH = '기술 스택 검색'
export const FILTER_RESET = '필터 초기화'

export const FILTER_CHIPS = [
  { key: 'category', label: '직무' },
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

export const FILTER_FIELD: Record<FilterKey, keyof JobFilters> = {
  category: 'category',
  skills: 'skills',
  career: 'careerYears',
  location: 'location',
  employment: 'employmentType',
}
