import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import PostingCard from '../jobs/posting-card'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { HOME_SECTIONS, HOME_SHORTCUTS } from './constants'

const HomeSection = ({
  sort,
  title,
  description,
}: {
  sort: 'latest' | 'deadline' | 'popular'
  title: string
  description: string
}) => {
  const query = useQuery({
    queryKey: ['postings', { sort }],
    queryFn: () => api.postings.list({ sort }),
  })
  const items = query.data?.data ?? []
  if (!query.data || items.length === 0) return null
  return (
    <section className="home-section">
      <div className="section-head">
        <div>
          <h2 className="h3">{title}</h2>
          <p className="c1 t3">{description}</p>
        </div>
        <Link to={`/jobs?sort=${sort}`}>전체보기</Link>
      </div>
      <div className="h-scroll">
        {items.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </section>
  )
}

const HomePage = () => {
  const session = useSession()
  const navigate = useNavigate()
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
            {shortcut.label}
          </Link>
        ))}
      </div>
      {HOME_SECTIONS.map((section) => (
        <HomeSection key={section.sort} sort={section.sort} title={section.title} description={section.description} />
      ))}
    </main>
  )
}

export default HomePage
