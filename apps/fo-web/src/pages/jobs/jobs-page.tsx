import { CAREER_YEARS, chipLabel, EMPLOYMENT_TYPES, JOB_CATEGORIES, withDeadlineWindow, type CareerYears, type EmploymentType, type JobCategory } from '@push/api-client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import FilterPopover from './filter-popover'
import PostingCard from './posting-card'
import { Icon } from '../../shared/ui/icon'
import { Popover } from '../../shared/ui/popover'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import { onFirstScroll } from './first-scroll'
import { EMPTY_FILTERS, FILTER_CHIPS, FILTER_RESET, FILTERED_EMPTY, FILTERED_EMPTY_HINT, JOB_PAGE_SIZE, JOBS_ERROR, JOB_SORTS, LOAD_MORE_MARGIN, LOADING_MORE, SORT_LABEL, sortFrom, type FilterKey, type JobFilters, type JobSort } from './constants'
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
  const sort = sortFrom(params.get('sort'))
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
  const [sortOpen, setSortOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const loader = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<JobFilters>(filters)
  const listQuery = usePostingPages(['postings', params.toString()], withDeadlineWindow({ ...filters, sort, limit: JOB_PAGE_SIZE }))
  const countQuery = usePostingCount(['posting-count', sort, draft], withDeadlineWindow({ ...draft, sort, limit: 1 }), facet !== null)
  const locationQuery = usePostingLocations(
    ['posting-locations', sort, draft.category, draft.skills, draft.careerYears, draft.employmentType],
    withDeadlineWindow({
      sort,
      category: draft.category,
      skills: draft.skills,
      careerYears: draft.careerYears,
      employmentType: draft.employmentType,
    }),
    facet === 'location',
  )
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = listQuery
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const total = listQuery.data?.pages[0]?.page.total ?? 0
  const filtered = Object.values(filters).some((value) => value.length > 0)
  const failed = listQuery.isError && items.length === 0
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
    setSortOpen(false)
    if (facet === key) {
      setFacet(null)
      return
    }
    setDraft(filters)
    setFacet(key)
  }
  const pickSort = (next: JobSort) => {
    const query = new URLSearchParams(params)
    query.set('sort', next)
    setParams(query)
    setSortOpen(false)
  }
  useEffect(() => onFirstScroll(window, () => setScrolled(true)), [])
  useEffect(() => {
    if (items.length === 0) return
    let live = true
    void document.fonts.ready.then(() => {
      if (live && document.documentElement.scrollHeight <= window.innerHeight) setScrolled(true)
    })
    return () => {
      live = false
    }
  }, [items.length])
  useEffect(() => {
    const node = loader.current
    if (!node || !hasNextPage || !scrolled) return
    if (typeof IntersectionObserver === 'undefined') {
      const onScroll = () => {
        if (!isFetchingNextPage && node.getBoundingClientRect().top < window.innerHeight + LOAD_MORE_MARGIN) void fetchNextPage()
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !isFetchingNextPage) void fetchNextPage()
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, items.length, scrolled])
  return (
    <main className="page jobs-page">
      <header className="head">
        <h1 className="h1">채용공고</h1>
      </header>
      <div className="chips jobs-chips">
        <button type="button" className="chip" aria-pressed={!filtered} onClick={() => write(EMPTY_FILTERS)}>
          전체
        </button>
        {FILTER_CHIPS.map((chip) => (
          <span key={chip.key} className="jobs-facet">
            <button
              type="button"
              className={facet === chip.key ? 'chip open' : 'chip'}
              aria-pressed={labelsFor(chip.key, filters).length > 0}
              aria-haspopup="dialog"
              aria-expanded={facet === chip.key}
              onClick={() => open(chip.key)}
            >
              {chipLabel(chip.label, labelsFor(chip.key, filters))}
              <Icon name="down" size={14} width={2.4} />
            </button>
            {facet === chip.key ? (
              <FilterPopover
                facet={chip.key}
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
          </span>
        ))}
      </div>
      {listQuery.isLoading ? <Skeleton rows={6} /> : null}
      {listQuery.isLoading || failed ? null : (
        <div className="jobs-meta b2">
          <b className="num">{`공고 ${total}개`}</b>
          {items.length > 0 ? (
            <span className="jobs-sort">
              <button type="button" className="t2 w6 jobs-sort-btn" aria-haspopup="menu" aria-expanded={sortOpen} onClick={() => setSortOpen((value) => !value)}>
                {SORT_LABEL[sort]}
                <Icon name="down" size={14} width={2.4} />
              </button>
              {sortOpen ? (
                <Popover label="정렬" onClose={() => setSortOpen(false)} className="jobs-sort-pop">
                  <div className="menu" role="menu">
                    {JOB_SORTS.map((key) => (
                      <button key={key} type="button" role="menuitemradio" aria-checked={key === sort} className={key === sort ? 'mi w7 on' : 'mi'} onClick={() => pickSort(key)}>
                        <span>{SORT_LABEL[key]}</span>
                        {key === sort ? <Icon name="check" size={18} width={2.4} /> : null}
                      </button>
                    ))}
                  </div>
                </Popover>
              ) : null}
            </span>
          ) : null}
        </div>
      )}
      {failed ? <ErrorState title={JOBS_ERROR} onRetry={() => void listQuery.refetch()} /> : null}
      {listQuery.isSuccess && items.length === 0 ? (
        <StateBlock
          icon="doc"
          title={FILTERED_EMPTY}
          description={FILTERED_EMPTY_HINT}
          action={
            filtered ? (
              <button type="button" className="btn sec sm" onClick={() => write(EMPTY_FILTERS)}>
                <Icon name="retry" size={16} width={2.2} />
                {FILTER_RESET}
              </button>
            ) : undefined
          }
        />
      ) : null}
      <div className="job-grid">
        {items.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
      {hasNextPage ? (
        <div ref={loader} className="jobs-loader c1 t3">
          <span className="jobs-spin" />
          {LOADING_MORE}
        </div>
      ) : null}
    </main>
  )
}

export default JobsPage
