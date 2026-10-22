import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AI_POSTING, FILTER_ALL, NEW_POSTING, POSTINGS_EMPTY, POSTINGS_FAILED, POSTINGS_LOADING, POSTINGS_TITLE, STATUS_CLOSED, STATUS_OPEN } from './constants'
import PostingRow from './posting-row'
import { useMyPostings } from '../../entities/posting'


const PostingsPage = () => {
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const postings = useMyPostings()
  if (postings.isError) {
    return (
      <main className="page">
        <header className="head">
          <h1 className="h1">{POSTINGS_TITLE}</h1>
        </header>
        <p className="b1 stack" role="alert">
          {POSTINGS_FAILED}
        </p>
      </main>
    )
  }
  if (!postings.data) {
    return (
      <main className="page" aria-busy="true">
        <p className="b2 t3 stack">{POSTINGS_LOADING}</p>
      </main>
    )
  }
  const rows = postings.data.data
  const open = rows.filter((item) => !item.closedAt)
  const closed = rows.filter((item) => item.closedAt)
  const visible = filter === 'open' ? open : filter === 'closed' ? closed : rows
  return (
    <main className="page">
      <header className="head biz-bar">
        <h1 className="h1">{POSTINGS_TITLE}</h1>
        <span className="biz-actions">
          <Link className="btn sec" to="/employer/chat/new">
            {AI_POSTING}
          </Link>
          <Link className="btn pri" to="/employer/postings/new">
            {NEW_POSTING}
          </Link>
        </span>
      </header>
      <div className="chips">
        {(
          [
            ['all', `${FILTER_ALL} ${rows.length}`],
            ['open', `${STATUS_OPEN} ${open.length}`],
            ['closed', `${STATUS_CLOSED} ${closed.length}`],
          ] as const
        ).map(([key, label]) => (
          <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="b2 t3">{POSTINGS_EMPTY}</p>
      ) : (
        <div className="biz-table-wrap">
          <table className="biz-table">
            <thead>
              <tr>
                <th>공고</th>
                <th>상태</th>
                <th>지원자</th>
                <th>마감</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((posting) => (
                <PostingRow key={posting.id} posting={posting} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default PostingsPage
