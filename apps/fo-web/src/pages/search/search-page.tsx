import type { Post, Posting, Profile } from '@push/api-client'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { Icon } from '../../shared/ui/icon'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import {
  SEARCH_CLEAR,
  SEARCH_EMPTY_HINT,
  SEARCH_ERROR,
  SEARCH_LOGIN_COPY,
  SEARCH_PEOPLE_TITLE,
  SEARCH_PREVIEW_PEOPLE,
  SEARCH_PREVIEW_POSTINGS,
  SEARCH_TABS,
  searchAllPostings,
  searchEmptyTitle,
  type SearchType,
} from './constants'
import { PersonRow, PostRow, PostingRow } from './search-results'
import SearchSide from './search-side'
import { clearRecentSearches, readRecentSearches, removeRecentSearch, saveRecentSearch } from '../../features/recent-searches'
import { useSearchPeople, useSearchPostings, useSearchPosts } from '../../features/search-catalog'


const isSearchType = (value: string | null): value is SearchType => SEARCH_TABS.some((tab) => tab.type === value)

const SearchPage = () => {
  const session = useSession()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const typeParam = params.get('type')
  const overview = !isSearchType(typeParam)
  const type: SearchType = isSearchType(typeParam) ? typeParam : 'postings'
  const [recent, setRecent] = useState(() => readRecentSearches())
  const [draft, setDraft] = useState(q)
  const ready = q.trim().length > 0
  useEffect(() => {
    setDraft(q)
    const next = q.trim()
    if (!next) return
    setRecent(saveRecentSearch(next))
  }, [q])
  const postings = useSearchPostings(q, ready)
  const people = useSearchPeople(q, ready && Boolean(session))
  const posts = useSearchPosts(q, ready && Boolean(session))
  const byType = { postings, people, posts }
  const gated = !session && type !== 'postings'
  const submit = (term: string) => {
    const next = term.trim()
    if (!next) return
    setRecent(saveRecentSearch(next))
    const query = new URLSearchParams(params)
    query.set('q', next)
    setParams(query, { preventScrollReset: true })
  }
  const clearQuery = () => {
    const query = new URLSearchParams(params)
    query.delete('q')
    setParams(query, { preventScrollReset: true })
  }
  const selectType = (next: SearchType) => {
    const query = new URLSearchParams(params)
    // the 공고 tab is the overview; 공고 N개 모두 보기 opens the full posting list
    if (next === 'postings') query.delete('type')
    else query.set('type', next)
    setParams(query, { preventScrollReset: true })
  }
  const returnTo = `/search?${new URLSearchParams({ q, type }).toString()}`
  const loginNote = (
    <p className="search-note b2">
      {SEARCH_LOGIN_COPY}{' '}
      <Link className="text-link" to="/login" onClick={() => saveReturnTo(returnTo)}>
        로그인
      </Link>
    </p>
  )
  const totalOf = (next: SearchType) => {
    const data = byType[next].data
    if (!data) return null
    return data.page.total ?? data.data.length
  }
  const empty = (
    <StateBlock
      icon="search"
      title={searchEmptyTitle(q)}
      description={SEARCH_EMPTY_HINT}
      action={
        <button type="button" className="btn sec sm" onClick={clearQuery}>
          {SEARCH_CLEAR}
        </button>
      }
    />
  )
  const postingRows = (postings.data?.data ?? []) as Posting[]
  const peopleRows = (people.data?.data ?? []) as Profile[]
  const postRows = (posts.data?.data ?? []) as Post[]
  const waited = overview ? [postings, ...(session ? [people] : [])] : [byType[type]]
  const retry = () => waited.forEach((query) => void query.refetch())
  let body: ReactNode = null
  if (gated) {
    body = loginNote
  } else if (ready && waited.every((query) => query.isError)) {
    body = <ErrorState title={SEARCH_ERROR} onRetry={retry} />
  } else if (ready && waited.some((query) => !query.data && !query.isError)) {
    body = <Skeleton rows={5} />
  } else if (ready && overview) {
    const postingTotal = totalOf('postings') ?? postingRows.length
    const shown = postingRows.slice(0, SEARCH_PREVIEW_POSTINGS)
    const persons = peopleRows.slice(0, SEARCH_PREVIEW_PEOPLE)
    // a failed section says so while the sections that loaded stay visible
    const peopleFailed = Boolean(session) && people.isError
    body =
      !postings.isError && !peopleFailed && shown.length === 0 && persons.length === 0 ? (
        empty
      ) : (
        <>
          {postings.isError ? <ErrorState title={SEARCH_ERROR} onRetry={() => void postings.refetch()} /> : null}
          {shown.length > 0 ? (
            <div className="search-list">
              {shown.map((posting) => (
                <PostingRow key={posting.id} posting={posting} q={q} />
              ))}
            </div>
          ) : null}
          {postingTotal > shown.length ? (
            <Link to={`/search?${new URLSearchParams({ q, type: 'postings' }).toString()}`} className="search-more b2 w6">
              {searchAllPostings(postingTotal)}
              <Icon name="next" size={16} width={2.2} />
            </Link>
          ) : null}
          {persons.length > 0 || peopleFailed ? (
            <>
              <hr className="search-hr" />
              <h2 className="h3 search-people">{SEARCH_PEOPLE_TITLE}</h2>
              {peopleFailed ? (
                <ErrorState title={SEARCH_ERROR} onRetry={() => void people.refetch()} />
              ) : (
                <div className="search-list">
                  {persons.map((person) => (
                    <PersonRow key={person.userId} person={person} q={q} />
                  ))}
                </div>
              )}
            </>
          ) : null}
          {!session ? loginNote : null}
        </>
      )
  } else if (ready && type === 'postings') {
    body =
      postingRows.length === 0 ? (
        empty
      ) : (
        <div className="search-list">
          {postingRows.map((posting) => (
            <PostingRow key={posting.id} posting={posting} q={q} />
          ))}
        </div>
      )
  } else if (ready && type === 'people') {
    body =
      peopleRows.length === 0 ? (
        empty
      ) : (
        <div className="search-list">
          {peopleRows.map((person) => (
            <PersonRow key={person.userId} person={person} q={q} />
          ))}
        </div>
      )
  } else if (ready) {
    body =
      postRows.length === 0 ? (
        empty
      ) : (
        <div className="search-list">
          {postRows.map((post) => (
            <PostRow key={post.id} post={post} q={q} />
          ))}
        </div>
      )
  }
  return (
    <main className="page search-layout">
      <div className="search-main">
        <form
          className="search-field"
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            submit(draft)
          }}
        >
          <Icon name="search" size={20} width={2.2} />
          <input aria-label="검색" value={draft} onChange={(event) => setDraft(event.target.value)} />
          {draft ? (
            <button
              type="button"
              className="search-clear"
              aria-label={SEARCH_CLEAR}
              onClick={() => {
                setDraft('')
                clearQuery()
              }}
            >
              <Icon name="close" size={18} width={2.4} />
            </button>
          ) : null}
        </form>
        <div className="search-tabs" role="tablist">
          {SEARCH_TABS.map((tab) => {
            const count = totalOf(tab.type)
            return (
              <button key={tab.type} type="button" className="chip" role="tab" aria-selected={type === tab.type} onClick={() => selectType(tab.type)}>
                {count == null ? tab.label : `${tab.label} ${count}`}
              </button>
            )
          })}
        </div>
        {body}
      </div>
      <SearchSide
        recent={recent}
        onPick={submit}
        onRemove={(term) => setRecent(removeRecentSearch(term))}
        onClear={() => {
          clearRecentSearches()
          setRecent([])
        }}
      />
    </main>
  )
}

export default SearchPage
