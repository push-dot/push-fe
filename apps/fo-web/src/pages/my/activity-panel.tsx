import { stageBadge } from '@push/api-client'
import { careerLabel } from '@push/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useApplications, useCalendar } from '../../entities/application'
import { useMyPosts } from '../../entities/post'
import { useFollows } from '../../entities/profile'
import { useBookmarks } from '../../entities/posting'
import { ACTIVITY_CHIP_KEY, APPLICATION_EMPTY, BOOKMARK_EMPTY, CALENDAR_EMPTY, FIT_NOTE, FOLLOW_EMPTY, POST_EMPTY } from './constants'


const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)

const dateLabel = (iso: string) => {
  const date = new Date(iso)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const ActivityPanel = ({ chip }: { chip: string }) => {
  const key = ACTIVITY_CHIP_KEY[chip as keyof typeof ACTIVITY_CHIP_KEY]
  const [month, setMonth] = useState(() => monthStart(new Date()))
  const from = month.toISOString()
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString()
  const applications = useApplications(key === 'applications')
  const events = useCalendar(from, to, key === 'calendar')
  const bookmarks = useBookmarks(key === 'bookmarks')
  const follows = useFollows(key === 'follows')
  const posts = useMyPosts(key === 'posts')
  const [day, setDay] = useState<number | null>(null)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const lead = month.getDay()
  const today = new Date()
  const sameMonth = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth()
  const selected = Math.min(day ?? (sameMonth ? today.getDate() : 1), daysInMonth)
  const onDay = (events.data?.data ?? []).filter((event) => {
    const date = new Date(event.startsAt)
    return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth() && date.getDate() === selected
  })
  return (
    <section className="stack">
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
      {key === 'applications' ? <p className="c1 t3">{FIT_NOTE}</p> : null}
      {key === 'calendar' ? (
        <>
          <div className="month-bar">
            <button type="button" className="hbtn" aria-label="이전 달" onClick={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)) }}>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
            <span className="h2 num">{`${month.getFullYear()}년 ${month.getMonth() + 1}월`}</span>
            <button type="button" className="hbtn" aria-label="다음 달" onClick={() => { setDay(null); setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)) }}>
              <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="month box">
            {WEEKDAYS.map((label) => (
              <b key={label} className="c1">
                {label}
              </b>
            ))}
            {Array.from({ length: lead }, (_, index) => (
              <span key={`pad-${index}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const date = index + 1
              const titles = (events.data?.data ?? [])
                .filter((event) => {
                  const when = new Date(event.startsAt)
                  return when.getFullYear() === month.getFullYear() && when.getMonth() === month.getMonth() && when.getDate() === date
                })
                .map((event) => event.title)
              return (
                <button key={date} type="button" className={date === selected ? 'on' : undefined} onClick={() => setDay(date)}>
                  {date}
                  {titles[0] ? <i>{titles[0]}</i> : null}
                </button>
              )
            })}
          </div>
          {events.data && onDay.length === 0 ? <p className="b2 t3">{CALENDAR_EMPTY}</p> : null}
          <ul className="activity-list">
            {onDay.map((event) => (
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
                    {posting.location} · {careerLabel(posting)}
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
