import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import PostingCard from '../jobs/posting-card'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { HOME_SECTIONS, HOME_SHORTCUTS, OPEN_APPLICATION_STAGES } from './constants'
import { postingsList, meBookmarks, applicationsList } from '../../shared/api/operations'


const HomeSection = ({ sort, title }: { sort: 'latest' | 'deadline' | 'popular'; title: string }) => {
  const query = useQuery({
    queryKey: ['postings', { sort }],
    queryFn: () => postingsList({ sort }),
  })
  const items = query.data?.data ?? []
  if (!query.data || items.length === 0) return null
  return (
    <section className="home-section">
      <div className="section-head">
        <h2 className="h2">{title}</h2>
        <Link to={`/jobs?sort=${sort}`}>
          전체보기
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
      <div className="h-scroll">
        {items.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </section>
  )
}

const ShortcutArt = ({ name }: { name: string }) => {
  if (name === 'bookmarks') {
    return (
      <svg viewBox="0 0 84 72" aria-hidden="true">
        <rect x="28" y="8" width="28" height="48" rx="6" fill="#FF8A3D" />
        <path d="M34 8h16v28l-8-5-8 5z" fill="#E5484D" />
      </svg>
    )
  }
  if (name === 'activity') {
    return (
      <svg viewBox="0 0 84 72" aria-hidden="true">
        <rect x="18" y="34" width="12" height="22" rx="3" fill="#7C6CFF" />
        <rect x="36" y="22" width="12" height="34" rx="3" fill="#3CCB7F" />
        <rect x="54" y="12" width="12" height="44" rx="3" fill="#5B8CFF" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 84 72" aria-hidden="true">
      <rect x="22" y="28" width="40" height="28" rx="6" fill="#5B4CF0" />
      <path d="M30 28v-4a12 12 0 0 1 24 0v4" fill="none" stroke="#8B7CFF" strokeWidth="4" />
    </svg>
  )
}

const HomePage = () => {
  const session = useSession()
  const navigate = useNavigate()
  const bookmarks = useQuery({ queryKey: ['bookmarks'], queryFn: () => meBookmarks(), enabled: Boolean(session) })
  const applications = useQuery({ queryKey: ['applications'], queryFn: () => applicationsList(), enabled: Boolean(session) })
  const hintFor = (key: string, hint: string) => {
    if (!session) return hint
    if (key === 'bookmarks' && bookmarks.data) return `저장한 공고 ${bookmarks.data.data.length}개`
    if (key === 'activity' && applications.data) {
      const count = applications.data.data.filter((item) => OPEN_APPLICATION_STAGES.includes(item.stage as (typeof OPEN_APPLICATION_STAGES)[number])).length
      return `진행 중인 지원 ${count}건`
    }
    return hint
  }
  return (
    <main className="page home">
      <div className="shortcuts">
        {HOME_SHORTCUTS.map((shortcut) => (
          <Link
            key={shortcut.to}
            to={shortcut.to}
            className="shortcut"
            onClick={(event) => {
              if (!shortcut.login || session) return
              event.preventDefault()
              saveReturnTo(shortcut.to)
              navigate('/login')
            }}
          >
            <span className="h3">{shortcut.label}</span>
            <span className="c1 t3">{hintFor(shortcut.key, shortcut.hint)}</span>
            <span className="shortcut-art">
              <ShortcutArt name={shortcut.key} />
            </span>
          </Link>
        ))}
      </div>
      {HOME_SECTIONS.map((section) => (
        <HomeSection key={section.sort} sort={section.sort} title={section.title} />
      ))}
    </main>
  )
}

export default HomePage
