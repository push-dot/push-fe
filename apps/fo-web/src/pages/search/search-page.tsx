import type { Post, Posting, Profile } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { isMock } from '../../shared/lib/bridge'
import { brandOf, careerLabel, initials } from '../../shared/lib/format'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { matchHangul } from '../../shared/lib/hangul-search'
import { SEARCH_EMPTY, SEARCH_LOGIN_COPY, SEARCH_TABS, TRENDING_SEARCHES, TRENDING_TITLE, type SearchType } from './constants'
import { clearRecentSearches, readRecentSearches, saveRecentSearch } from './recent-searches'
import { searchCatalog } from '../../shared/api/operations'


const isSearchType = (value: string | null): value is SearchType => SEARCH_TABS.some((tab) => tab.type === value)

const Highlight = ({ text, query }: { text: string; query: string }) => {
  const match = matchHangul(text, query)
  if (!match) return text
  return (
    <>
      {text.slice(0, match.start)}
      <mark>{text.slice(match.start, match.end)}</mark>
      {text.slice(match.end)}
    </>
  )
}

const SearchPage = () => {
  const session = useSession()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const typeParam = params.get('type')
  const type: SearchType = isSearchType(typeParam) ? typeParam : 'postings'
  const [recent, setRecent] = useState(() => readRecentSearches())
  const ready = q.trim().length > 0
  useEffect(() => {
    const next = q.trim()
    if (!next) return
    setRecent(saveRecentSearch(next))
  }, [q])
  const postings = useQuery({
    queryKey: ['search', 'postings', q],
    queryFn: () => searchCatalog(q, 'postings'),
    enabled: ready,
  })
  const people = useQuery({
    queryKey: ['search', 'people', q],
    queryFn: () => searchCatalog(q, 'people'),
    enabled: ready && Boolean(session),
  })
  const posts = useQuery({
    queryKey: ['search', 'posts', q],
    queryFn: () => searchCatalog(q, 'posts'),
    enabled: ready && Boolean(session),
  })
  const byType = { postings, people, posts }
  const gated = !session && type !== 'postings'
  const submit = (term: string) => {
    const next = term.trim()
    if (!next) return
    setRecent(saveRecentSearch(next))
    const query = new URLSearchParams(params)
    query.set('q', next)
    query.set('type', type)
    setParams(query)
  }
  const selectType = (next: SearchType) => {
    const query = new URLSearchParams(params)
    query.set('type', next)
    setParams(query)
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
  const countOf = (next: SearchType) => {
    const data = byType[next].data
    if (!data) return null
    return data.page.total ?? data.data.length
  }
  let body: ReactNode = null
  if (gated) {
    body = loginNote
  } else if (ready && type === 'postings') {
    const rows = (postings.data?.data ?? []) as Posting[]
    body =
      postings.data && rows.length === 0 ? (
        <p className="b2 t3">{SEARCH_EMPTY}</p>
      ) : (
        <div className="search-list">
          {rows.map((posting) => (
            <Link key={posting.id} to={`/postings/${posting.id}`} className="search-row">
              <span className="ph" style={{ background: brandOf(posting.company) }}>
                {initials(posting.company)}
              </span>
              <span className="search-copy">
                <span className="c1 t3">
                  <Highlight text={posting.company} query={q} />
                </span>
                <strong>
                  <Highlight text={posting.title} query={q} />
                </strong>
                <span className="c1 t3">
                  {posting.location} · {careerLabel(posting.careerMin, posting.careerMax).replace(/^경력 /, '')}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )
  } else if (ready && type === 'people') {
    const rows = (people.data?.data ?? []) as Profile[]
    body =
      people.data && rows.length === 0 ? (
        <p className="b2 t3">{SEARCH_EMPTY}</p>
      ) : (
        <div className="search-list">
          {rows.map((person) => (
            <Link key={person.userId} to={`/profiles/${person.userId}`} className="search-row">
              <span className="ph" style={{ background: brandOf(person.displayName) }}>
                {initials(person.displayName)}
              </span>
              <span className="search-copy">
                <strong>
                  <Highlight text={person.displayName} query={q} />
                </strong>
                <span className="c1 t3">
                  <Highlight text={person.headline} query={q} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      )
  } else if (ready) {
    const rows = (posts.data?.data ?? []) as Post[]
    body =
      posts.data && rows.length === 0 ? (
        <p className="b2 t3">{SEARCH_EMPTY}</p>
      ) : (
        <div className="search-list">
          {rows.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="search-row">
              <span className="search-copy">
                <strong>
                  <Highlight text={post.title} query={q} />
                </strong>
                <span className="c1 t3">
                  <Highlight text={post.body} query={q} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      )
  }
  return (
    <main className="page search-layout">
      <div className="feed">
        <div className="search-tabs" role="tablist">
          {SEARCH_TABS.map((tab) => {
            const count = countOf(tab.type)
            return (
              <button key={tab.type} type="button" className="chip" role="tab" aria-selected={type === tab.type} onClick={() => selectType(tab.type)}>
                {count == null ? tab.label : `${tab.label} ${count}`}
              </button>
            )
          })}
        </div>
        {body}
      </div>
      <aside className="search-side">
        {recent.length > 0 ? (
          <section className="box" style={{ padding: 18 }}>
            <div className="recent-head">
              <h2 className="h3">최근 검색어</h2>
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  clearRecentSearches()
                  setRecent([])
                }}
              >
                모두 지우기
              </button>
            </div>
            <div className="skill-row">
              {recent.map((term) => (
                <button key={term} type="button" className="chip" onClick={() => submit(term)}>
                  {term}
                </button>
              ))}
            </div>
          </section>
        ) : null}
        {isMock() ? (
          <section className="box" style={{ padding: 18 }}>
            <h2 className="h3">{TRENDING_TITLE}</h2>
            <ol className="trend">
              {TRENDING_SEARCHES.map((term, index) => (
                <li key={term}>
                  <button type="button" onClick={() => submit(term)}>
                    <span className="t3">{index + 1}</span>
                    <span>{term}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </aside>
    </main>
  )
}

export default SearchPage
