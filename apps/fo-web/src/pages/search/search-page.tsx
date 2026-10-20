import type { Post, Posting, Profile } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../../api'
import { isMock } from '../../bridge'
import { careerLabel } from '../../format'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { matchHangul } from '../../shared/lib/hangul-search'
import { SEARCH_LOGIN_COPY, SEARCH_TABS, TRENDING_SEARCHES, type SearchType } from './constants'
import { clearRecentSearches, readRecentSearches, saveRecentSearch } from './recent-searches'

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
  const [draft, setDraft] = useState(q)
  const [recent, setRecent] = useState(() => readRecentSearches())
  useEffect(() => {
    setDraft(q)
  }, [q])
  const gated = !session && type !== 'postings'
  const results = useQuery({
    queryKey: ['search', type, q],
    queryFn: () => api.search(q, type),
    enabled: q.trim().length > 0 && !gated,
  })
  const submit = (term: string) => {
    const next = term.trim()
    if (!next) return
    setRecent(saveRecentSearch(next))
    const query = new URLSearchParams(params)
    query.set('q', next)
    query.set('type', type)
    setParams(query)
    setDraft(next)
  }
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    submit(draft)
  }
  const selectType = (next: SearchType) => {
    const query = new URLSearchParams(params)
    query.set('type', next)
    setParams(query)
  }
  const returnTo = `/search?${new URLSearchParams({ q, type }).toString()}`
  const loginNote = gated ? (
    <p className="search-note b2">
      {SEARCH_LOGIN_COPY}{' '}
      <Link className="text-link" to="/login" onClick={() => saveReturnTo(returnTo)}>
        로그인
      </Link>
    </p>
  ) : null
  let body: ReactNode = null
  if (!q) {
    body = (
      <>
        {recent.length > 0 ? (
          <section className="recent">
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
            <ul className="recent-list">
              {recent.map((term) => (
                <li key={term}>
                  <button type="button" className="chip" onClick={() => submit(term)}>
                    {term}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {isMock() ? (
          <section className="recent">
            <h2 className="h3">많이 찾는 검색어</h2>
            <ol className="trend-list">
              {TRENDING_SEARCHES.map((term) => (
                <li key={term}>
                  <button type="button" className="chip" onClick={() => submit(term)}>
                    {term}
                  </button>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {loginNote}
      </>
    )
  } else if (gated) {
    body = loginNote
  } else if (type === 'postings') {
    const rows = (results.data?.data ?? []) as Posting[]
    body = (
      <div className="search-list">
        {rows.map((posting) => (
          <Link key={posting.id} to={`/postings/${posting.id}`} className="search-row">
            <strong>
              <Highlight text={posting.title} query={q} />
            </strong>
            <span className="c1 t3">
              <Highlight text={posting.company} query={q} /> · {posting.location} · {careerLabel(posting.careerMin, posting.careerMax)}
            </span>
          </Link>
        ))}
      </div>
    )
  } else if (type === 'people') {
    const rows = (results.data?.data ?? []) as Profile[]
    body = (
      <div className="search-list">
        {rows.map((person) => (
          <Link key={person.userId} to={`/profiles/${person.userId}`} className="search-row">
            <strong>
              <Highlight text={person.displayName} query={q} />
            </strong>
            <span className="c1 t3">
              <Highlight text={person.headline} query={q} />
            </span>
          </Link>
        ))}
      </div>
    )
  } else {
    const rows = (results.data?.data ?? []) as Post[]
    body = (
      <div className="search-list">
        {rows.map((post) => (
          <Link key={post.id} to={`/posts/${post.id}`} className="search-row">
            <strong>
              <Highlight text={post.title} query={q} />
            </strong>
            <p className="c1 t3">
              <Highlight text={post.body} query={q} />
            </p>
          </Link>
        ))}
      </div>
    )
  }
  return (
    <main className="page search">
      <form className="search-form" onSubmit={onSubmit}>
        <input value={draft} placeholder="검색" aria-label="검색" onChange={(event) => setDraft(event.target.value)} />
      </form>
      <div className="search-tabs" role="tablist">
        {SEARCH_TABS.map((tab) => (
          <button key={tab.type} type="button" className="chip" role="tab" aria-selected={type === tab.type} onClick={() => selectType(tab.type)}>
            {tab.label}
          </button>
        ))}
      </div>
      {body}
    </main>
  )
}

export default SearchPage
