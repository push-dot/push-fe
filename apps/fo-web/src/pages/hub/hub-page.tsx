import { CAREER_STATUSES, HUB_CATEGORIES, TENURES, type JobCategory } from '@push/api-client'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '../../shared/ui/icon'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock from '../../shared/ui/state-block'
import { HUB_PAGE_SIZE } from './constants'
import HubFilterSheet, { countApplied, type HubDraft } from './hub-filter-sheet'
import ProfileCard from './profile-card'
import { useProfilePages } from '../../entities/profile'


const filtersOf = (categories: JobCategory[], draft: HubDraft) => ({
  category: categories.length > 0 ? categories : undefined,
  tenure: draft.tenure ? [draft.tenure] : undefined,
  status: draft.status ? [draft.status] : undefined,
})

const HubPage = () => {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [applied, setApplied] = useState<HubDraft>({})
  const [draft, setDraft] = useState<HubDraft>({})
  const [open, setOpen] = useState(false)
  const listQuery = useProfilePages(['profiles', categories, applied], { ...filtersOf(categories, applied), limit: HUB_PAGE_SIZE })
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const filterCount = countApplied(applied)
  const summary = [
    applied.tenure ? TENURES.find((item) => item.key === applied.tenure)?.label : null,
    applied.status ? CAREER_STATUSES.find((item) => item.key === applied.status)?.label : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const chips = [...HUB_CATEGORIES].sort((a, b) => Number(categories.includes(b.key)) - Number(categories.includes(a.key)))
  const toggle = (key: JobCategory) => setCategories((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))
  const reset = () => {
    setCategories([])
    setApplied({})
    setDraft({})
  }
  return (
    <main className="page">
      <header className="head hub-head">
        <h1 className="h1">허브</h1>
        <Link to="/search" className="search-field hub-search">
          <Icon name="search" size={18} width={2.2} />
          이름, 직무, 기술 검색
        </Link>
      </header>
      <div className="hub-chips">
        {chips.map((item) => (
          <button key={item.key} type="button" className="chip" aria-pressed={categories.includes(item.key)} onClick={() => toggle(item.key)}>
            {item.label}
          </button>
        ))}
        <div className="hub-filter">
          <button
            type="button"
            className={open ? 'chip open' : 'chip'}
            aria-expanded={open}
            onClick={() => {
              setDraft(applied)
              setOpen((value) => !value)
            }}
          >
            <Icon name="filter" size={16} width={2.2} />
            필터
            {filterCount > 0 ? <span className="side-count">{filterCount}</span> : null}
          </button>
          {open ? (
            <HubFilterSheet
              draft={draft}
              onChange={setDraft}
              onClose={() => setOpen(false)}
              onApply={() => {
                setApplied(draft)
                setOpen(false)
              }}
            />
          ) : null}
        </div>
      </div>
      <section className="hub-list">
        <div className="hub-title">
          <h2 className="h2">추천 프로필</h2>
          {summary ? <span className="b2 t3">{summary}</span> : null}
        </div>
        <div className="hub-grid">
          {items.map((profile) => (
            <ProfileCard key={profile.userId} profile={profile} />
          ))}
        </div>
        {listQuery.isError ? <p className="b2 t3">프로필을 불러오지 못했어요.</p> : null}
        {listQuery.isLoading ? <Skeleton rows={5} /> : null}
        {!listQuery.isLoading && items.length === 0 ? (
          <StateBlock
            icon="people"
            title="조건에 맞는 프로필이 없어요."
            action={
              <button type="button" className="btn sec sm" onClick={reset}>
                <Icon name="retry" size={16} width={2.2} />
                필터 초기화
              </button>
            }
          />
        ) : null}
      </section>
      {listQuery.hasNextPage ? (
        <button type="button" className="more" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
          더 보기
        </button>
      ) : null}
    </main>
  )
}

export default HubPage
