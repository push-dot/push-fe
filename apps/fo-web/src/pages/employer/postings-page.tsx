import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { NEW_POSTING, POSTINGS_EMPTY, POSTINGS_FAILED, POSTINGS_LOADING, POSTINGS_TITLE } from './constants'
import PostingRow from './posting-row'

const PostingsPage = () => {
  const postings = useQuery({ queryKey: ['company-postings'], queryFn: () => api.postings.mine() })
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
  return (
    <main className="page">
      <header className="head">
        <h1 className="h1">{POSTINGS_TITLE}</h1>
        <Link className="pill" to="/employer/postings/new">
          {NEW_POSTING}
        </Link>
      </header>
      {postings.data.data.length === 0 ? (
        <p className="b2 t3 stack">{POSTINGS_EMPTY}</p>
      ) : (
        <ul className="activity-list stack">
          {postings.data.data.map((posting) => (
            <PostingRow key={posting.id} posting={posting} />
          ))}
        </ul>
      )}
    </main>
  )
}

export default PostingsPage
