import { CAREER_STATUSES, type Post, type Posting, type Profile } from '@push/api-client'
import { brandColor, careerLabel, matchHangul } from '@push/shared'
import { Link } from 'react-router-dom'

import { initials } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'

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

export const PostingRow = ({ posting, q }: { posting: Posting; q: string }) => (
  <Link to={`/postings/${posting.id}`} className="search-row">
    <span className="ph" style={{ background: brandColor(posting.company) }}>
      {[...posting.company][0]}
    </span>
    <span className="search-copy">
      <span className="c1 t3 w6">
        <Highlight text={posting.company} query={q} />
      </span>
      <strong className="b1 w7">
        <Highlight text={posting.title} query={q} />
      </strong>
      <span className="c1 t3">
        {posting.location} · {careerLabel(posting)}
      </span>
    </span>
    <span className={posting.bookmarked ? 'search-bm on' : 'search-bm'}>
      <Icon name="bookmark" size={22} filled={posting.bookmarked} />
    </span>
  </Link>
)

export const PersonRow = ({ person, q }: { person: Profile; q: string }) => {
  const status = CAREER_STATUSES.find((item) => item.key === person.careerStatus)?.label
  const tone = person.careerStatus === 'seeking' ? 'green' : person.careerStatus === 'feedback' ? 'orange' : 'grey'
  return (
    <Link to={`/profiles/${person.userId}`} className="search-row person">
      <span className="ph" style={{ background: brandColor(person.displayName) }}>
        {initials(person.displayName)}
      </span>
      <span className="search-copy">
        <span className="hub-name">
          <span className="b1 w7">
            <Highlight text={person.displayName} query={q} />
          </span>
          {status ? <span className={`badge ${tone}`}>{status}</span> : null}
        </span>
        <span className="c1 t3">
          <Highlight text={person.headline} query={q} />
        </span>
      </span>
    </Link>
  )
}

export const PostRow = ({ post, q }: { post: Post; q: string }) => (
  <Link to={`/posts/${post.id}`} className="search-row">
    <span className="search-copy">
      <strong className="b1 w7">
        <Highlight text={post.title} query={q} />
      </strong>
      <span className="c1 t3">
        <Highlight text={post.body} query={q} />
      </span>
    </span>
  </Link>
)
