import { CAREER_YEARS, chipLabel, EMPLOYMENT_TYPES, JOB_CATEGORIES, type CareerYears, type EmploymentType, type JobCategory } from '@push/api-client'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import FilterSheet from './filter-sheet'
import PostingCard from './posting-card'
import { EMPTY_FILTERS, FILTER_CHIPS, JOB_PAGE_SIZE, JOB_SORTS, SORT_LABEL, type FilterKey, type JobFilters, type JobSort } from './constants'
import { usePostingCount, usePostingLocations, usePostingPages } from '../../entities/posting'


const readList = (params: URLSearchParams, key: string) =>
  (params.get(key) ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

const labelsFor = (facet: FilterKey, filters: JobFilters) => {
  if (facet === 'category') return JOB_CATEGORIES.filter((item) => filters.category.includes(item.key)).map((item) => item.label)
  if (facet === 'skills') return filters.skills
  if (facet === 'career') return CAREER_YEARS.filter((item) => filters.careerYears.includes(item.key)).map((item) => item.label)
  if (facet === 'location') return filters.location
  return EMPLOYMENT_TYPES.filter((item) => filters.employmentType.includes(item.key)).map((item) => item.label)
}

const JobsPage = () => {
  const [params, setParams] = useSearchParams()
  const sortParam = params.get('sort')
  const sort: JobSort = JOB_SORTS.includes(sortParam as JobSort) ? (sortParam as JobSort) : 'latest'
  const filters = useMemo<JobFilters>(
    () => ({
      category: readList(params, 'category') as JobCategory[],
      skills: readList(params, 'skills'),
      careerYears: readList(params, 'careerYears') as CareerYears[],
      location: readList(params, 'location'),
      employmentType: readList(params, 'employmentType') as EmploymentType[],
    }),
    [params],
  )
  const [facet, setFacet] = useState<FilterKey | null>(null)
  const [draft, setDraft] = useState<JobFilters>(filters)
  const listQuery = usePostingPages(['postings', params.toString()], { ...filters, sort, limit: JOB_PAGE_SIZE })
  const countQuery = usePostingCount(['posting-count', sort, draft], { ...draft, sort, limit: 1 }, facet !== null)
  const locationQuery = usePostingLocations(
    ['posting-locations', sort, draft.category, draft.skills, draft.careerYears, draft.employmentType],
    {
      sort,
      category: draft.category,
      skills: draft.skills,
      careerYears: draft.careerYears,
      employmentType: draft.employmentType,
    },
    facet === 'location',
  )
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const total = listQuery.data?.pages[0]?.page.total ?? 0
  const filtered = Object.values(filters).some((value) => value.length > 0)
  const write = (next: JobFilters) => {
    const query = new URLSearchParams(params)
    query.set('sort', sort)
    const setList = (key: string, values: string[]) => {
      if (values.length === 0) query.delete(key)
      else query.set(key, values.join(','))
    }
    setList('category', next.category)
    setList('skills', next.skills)
    setList('careerYears', next.careerYears)
    setList('location', next.location)
    setList('employmentType', next.employmentType)
    setParams(query)
  }
  const open = (key: FilterKey) => {
    setDraft(filters)
    setFacet(key)
  }
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">채용공고</h1>
        <div className="jobs-meta">
          <span className="b2 w7">{`공고 ${total}개`}</span>
          <span className="c1 t3">{SORT_LABEL[sort]}</span>
        </div>
      </header>
      <div className="chips">
        <button type="button" className="chip" aria-pressed={!filtered} onClick={() => write(EMPTY_FILTERS)}>
          전체
        </button>
        {FILTER_CHIPS.map((chip) => (
          <button key={chip.key} type="button" className="chip" aria-pressed={labelsFor(chip.key, filters).length > 0} onClick={() => open(chip.key)}>
            {chipLabel(chip.label, labelsFor(chip.key, filters))}
          </button>
        ))}
      </div>
      <div className="job-grid">
        {items.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
      {listQuery.hasNextPage ? (
        <button type="button" className="more" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
          더 보기
        </button>
      ) : null}
      {facet ? (
        <FilterSheet
          facet={facet}
          draft={draft}
          locations={locationQuery.data ?? []}
          total={countQuery.data?.page.total ?? 0}
          onChange={setDraft}
          onClose={() => setFacet(null)}
          onApply={() => {
            write(draft)
            setFacet(null)
          }}
        />
      ) : null}
    </main>
  )
}

export default JobsPage
