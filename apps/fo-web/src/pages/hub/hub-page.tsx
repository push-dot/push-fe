import { CAREER_STATUSES, HUB_CATEGORIES, TENURES, type JobCategory } from '@push/api-client'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { HUB_PAGE_SIZE } from './constants'
import HubFilterSheet, { type HubDraft } from './hub-filter-sheet'
import ProfileCard from './profile-card'

const filtersOf = (categories: JobCategory[], draft: HubDraft) => ({
  category: categories.length > 0 ? categories : undefined,
  tenure: draft.tenure,
  status: draft.status,
  explore: draft.explore,
})

const HubPage = () => {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [applied, setApplied] = useState<HubDraft>({ explore: 'recommended' })
  const [draft, setDraft] = useState<HubDraft>({ explore: 'recommended' })
  const [open, setOpen] = useState(false)
  const listQuery = useInfiniteQuery({
    queryKey: ['profiles', categories, applied],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.profiles.list({ ...filtersOf(categories, applied), cursor: pageParam, limit: HUB_PAGE_SIZE }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })
  const countQuery = useQuery({
    queryKey: ['profiles', 'count', categories, draft],
    queryFn: () => api.profiles.list({ ...filtersOf(categories, draft), limit: 1 }),
    enabled: open,
  })
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const filterCount = (applied.tenure ? 1 : 0) + (applied.status ? 1 : 0) + (applied.explore === 'offers' ? 1 : 0)
  const summary = [
    applied.tenure ? TENURES.find((item) => item.key === applied.tenure)?.label : null,
    applied.status ? CAREER_STATUSES.find((item) => item.key === applied.status)?.label : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const toggle = (key: JobCategory) => setCategories((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))
  return (
    <main className="page">
      <header className="head hub-head">
        <h1 className="h1">허브</h1>
        <Link to="/search" className="hub-search">
          이름, 직무, 기술 검색
        </Link>
      </header>
      <div className="chips">
        {HUB_CATEGORIES.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={categories.includes(item.key)} onClick={() => toggle(item.key)}>
            {item.label}
          </button>
        ))}
        <button
          type="button"
          className="chip"
          onClick={() => {
            setDraft(applied)
            setOpen(true)
          }}
        >
          필터
          {filterCount > 0 ? <span className="side-count">{filterCount}</span> : null}
        </button>
      </div>
      <section className="stack">
        <h2 className="h2">추천 프로필</h2>
        {summary ? <p className="c1 t3">{summary}</p> : null}
        <div className="hub-grid">
          {items.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} />
          ))}
        </div>
        {listQuery.isError ? <p className="b2 t3">프로필을 불러오지 못했어요.</p> : null}
        {!listQuery.isLoading && items.length === 0 ? <p className="b2 t3">조건에 맞는 프로필이 없어요.</p> : null}
      </section>
      {listQuery.hasNextPage ? (
        <button type="button" className="more" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
          더 보기
        </button>
      ) : null}
      {open ? (
        <HubFilterSheet
          draft={draft}
          total={countQuery.data?.page.total ?? 0}
          onChange={setDraft}
          onClose={() => setOpen(false)}
          onApply={() => {
            setApplied(draft)
            setOpen(false)
          }}
        />
      ) : null}
    </main>
  )
}

export default HubPage
