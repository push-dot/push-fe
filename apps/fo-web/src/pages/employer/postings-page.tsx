import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AI_POSTING, FILTER_ALL, NEW_POSTING, POSTINGS_EMPTY, POSTINGS_FAILED, POSTINGS_HEAD, POSTINGS_LOADING, POSTINGS_TITLE, STATUS_CLOSED, STATUS_OPEN } from './constants'
import { Icon } from '../../shared/ui/icon'
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
  const complete = !postings.data.page.hasMore
  const open = rows.filter((item) => !item.closedAt)
  const closed = rows.filter((item) => item.closedAt)
  const visible = filter === 'open' ? open : filter === 'closed' ? closed : rows
  return (
    <main className="page">
      <header className="head biz-bar">
        <h1 className="h1">{POSTINGS_TITLE}</h1>
        <span className="biz-actions">
          <Link className="btn sec sm" to="/employer/chat/new">
            <Icon name="spark" size={16} filled />
            {AI_POSTING}
          </Link>
          <Link className="btn pri sm" to="/employer/postings/new">
            <Icon name="plus" size={16} width={2.4} />
            {NEW_POSTING}
          </Link>
        </span>
      </header>
      <div className="chips">
        {(
          [
            ['all', FILTER_ALL, rows],
            ['open', STATUS_OPEN, open],
            ['closed', STATUS_CLOSED, closed],
          ] as const
        ).map(([key, label, group]) => (
          <button key={key} type="button" className="chip" aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {complete ? `${label} ${group.length}` : label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="b2 t3">{POSTINGS_EMPTY}</p>
      ) : (
        <div className="box jobs-card posting-cols">
          <div className="jobs-head c1 w7 t3" aria-hidden="true">
            {POSTINGS_HEAD.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <ul className="jobs-list">
            {visible.map((posting) => (
              <PostingRow key={posting.id} posting={posting} />
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}

export default PostingsPage
