import { stageBadge } from '@push/api-client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { careerLabel } from '../../format'
import { ACTIVITY_CHIP_KEY, APPLICATION_EMPTY, BOOKMARK_EMPTY, CALENDAR_EMPTY, FOLLOW_EMPTY, POST_EMPTY } from './constants'

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const dateLabel = (iso: string) => {
  const date = new Date(iso)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

const ActivityPanel = ({ chips, chip, onChip }: { chips: readonly string[]; chip: string; onChip: (label: string) => void }) => {
  const key = ACTIVITY_CHIP_KEY[chip as keyof typeof ACTIVITY_CHIP_KEY]
  const [month, setMonth] = useState(() => monthStart(new Date()))
  const from = month.toISOString()
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString()
  const applications = useQuery({ queryKey: ['applications'], queryFn: () => api.applications.list(), enabled: key === 'applications' })
  const events = useQuery({
    queryKey: ['calendar', from, to],
    queryFn: () => api.calendar.events(from, to),
    enabled: key === 'calendar',
  })
  const bookmarks = useQuery({ queryKey: ['bookmarks'], queryFn: () => api.me.bookmarks(), enabled: key === 'bookmarks' })
  const follows = useQuery({ queryKey: ['follows'], queryFn: () => api.me.follows(), enabled: key === 'follows' })
  const posts = useQuery({ queryKey: ['my-posts'], queryFn: () => api.me.posts(), enabled: key === 'posts' })
  return (
    <section className="stack">
      <div className="chips activity-chips">
        {chips.map((label) => (
          <button key={label} type="button" className="chip" aria-pressed={label === chip} onClick={() => onChip(label)}>
            {label}
          </button>
        ))}
      </div>
      {key === 'applications' ? (
        applications.data && applications.data.data.length === 0 ? (
          <p className="b2 t3">{APPLICATION_EMPTY}</p>
        ) : (
          <ul className="activity-list">
            {(applications.data?.data ?? []).map((item) => (
              <li key={item.id} className="activity-row">
                <span className="c1 t3">{item.company}</span>
                <strong className="b1">{item.title}</strong>
                <span className="badge grey">{stageBadge(item.stage)}</span>
                {typeof item.fitScore === 'number' ? <span className="fit-score">{`적합도 ${item.fitScore}`}</span> : null}
              </li>
            ))}
          </ul>
        )
      ) : null}
      {key === 'calendar' ? (
        <>
          <div className="month-bar">
            <button type="button" className="text-link" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              이전 달
            </button>
            <span className="b2 w7">{`${month.getFullYear()}년 ${month.getMonth() + 1}월`}</span>
            <button type="button" className="text-link" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              다음 달
            </button>
          </div>
          {events.data && events.data.data.length === 0 ? <p className="b2 t3">{CALENDAR_EMPTY}</p> : null}
          <ul className="activity-list">
            {(events.data?.data ?? []).map((event) => (
              <li key={event.id} className="activity-row">
                <strong className="b1">{event.title}</strong>
                <span className="c1 t3">{dateLabel(event.startsAt)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      {key === 'bookmarks' ? (
        bookmarks.data && bookmarks.data.data.length === 0 ? (
          <p className="b2 t3">{BOOKMARK_EMPTY}</p>
        ) : (
          <ul className="activity-list">
            {(bookmarks.data?.data ?? []).map((posting) => (
              <li key={posting.id}>
                <Link to={`/postings/${posting.id}`} className="bookmark-row">
                  <span className="c1 t3">{posting.company}</span>
                  <strong className="b1">{posting.title}</strong>
                  <span className="c1 t2">
                    {posting.location} · {careerLabel(posting.careerMin, posting.careerMax)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
      {key === 'follows' ? (
        follows.data && follows.data.data.length === 0 ? (
          <p className="b2 t3">{FOLLOW_EMPTY}</p>
        ) : (
          <ul className="activity-list">
            {(follows.data?.data ?? []).map((profile) => (
              <li key={profile.userId}>
                <Link to={`/profiles/${profile.userId}`} className="bookmark-row">
                  <strong className="b1">{profile.displayName}</strong>
                  <span className="b2 t2">{profile.headline}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
      {key === 'posts' ? (
        posts.data && posts.data.data.length === 0 ? (
          <p className="b2 t3">{POST_EMPTY}</p>
        ) : (
          <ul className="activity-list">
            {(posts.data?.data ?? []).map((post) => (
              <li key={post.id}>
                <Link to={`/posts/${post.id}`} className="bookmark-row">
                  <strong className="b1">{post.title}</strong>
                  <span className="c1 t3">{`댓글 ${post.commentCount}`}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </section>
  )
}

export default ActivityPanel
