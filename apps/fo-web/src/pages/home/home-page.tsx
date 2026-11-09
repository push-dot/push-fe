import { Link, useNavigate } from 'react-router-dom'

import PostingCard from '../jobs/posting-card'
import { useApplications } from '../../entities/application'
import { useBookmarks, usePostingList } from '../../entities/posting'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { CardSkeletons } from '../../shared/ui/skeleton'
import { ErrorState } from '../../shared/ui/state-block'
import { HOME_ERROR, HOME_SECTIONS, HOME_SHORTCUTS, HOME_SKELETON_CARDS, OPEN_APPLICATION_STAGES } from './constants'
import ShortcutArt from './shortcut-art'


const ShortcutSkeleton = () => (
  <span className="shortcut shortcut-sk" aria-hidden="true">
    <span className="sk-bar sk-name" />
    <span className="sk-bar sk-hint" />
  </span>
)

const HomeSection = ({ sort, title }: { sort: 'latest' | 'deadline' | 'popular'; title: string }) => {
  const query = usePostingList(sort)
  const items = query.data?.data ?? []
  if (query.isLoading) {
    return (
      <section className="home-section" aria-busy="true">
        <div className="section-head sk-head">
          <span className="sk-bar sk-title" />
          <span className="sk-bar sk-more" />
        </div>
        <CardSkeletons count={HOME_SKELETON_CARDS} />
      </section>
    )
  }
  if (!query.isError && (!query.data || items.length === 0)) return null
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
      {query.isError ? (
        <div className="card home-error">
          <ErrorState title={HOME_ERROR.title} description={HOME_ERROR.body} onRetry={() => void query.refetch()} />
        </div>
      ) : (
        <div className="h-scroll">
          {items.map((posting) => (
            <PostingCard key={posting.id} posting={posting} />
          ))}
        </div>
      )}
    </section>
  )
}

const HomePage = () => {
  const session = useSession()
  const navigate = useNavigate()
  const bookmarks = useBookmarks(Boolean(session))
  const applications = useApplications(Boolean(session))
  const hintFor = (key: string, hint: string) => {
    if (!session) return hint
    if (key === 'bookmarks' && bookmarks.data) return `저장한 공고 ${bookmarks.data.data.length}개`
    if (key === 'activity' && applications.data) {
      const count = applications.data.data.filter((item) => OPEN_APPLICATION_STAGES.includes(item.stage as (typeof OPEN_APPLICATION_STAGES)[number])).length
      return `진행 중인 지원 ${count}건`
    }
    return hint
  }
  const shortcutsLoading = Boolean(session) && (bookmarks.isLoading || applications.isLoading)
  return (
    <main className="page home">
      <div className="shortcuts">
        {shortcutsLoading
          ? HOME_SHORTCUTS.map((shortcut) => <ShortcutSkeleton key={shortcut.to} />)
          : HOME_SHORTCUTS.map((shortcut) => (
              <Link
                key={shortcut.to}
                to={shortcut.to}
                className={`shortcut shortcut-${shortcut.key}`}
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
