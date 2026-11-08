import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { brandColor } from '@push/shared'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { compactCount, initials } from '../../shared/lib/format'
import { useSession } from '../../shared/auth/use-session'
import ComposerSheet from './composer-sheet'
import { composerPrompt } from '../../features/compose-post'
import Skeleton from '../../shared/ui/skeleton'
import { COMPOSER_ACTION, POPULAR_TITLE, POST_PAGE_SIZE, SOCIAL_EMPTY, SOCIAL_ERROR, SOCIAL_RETRY } from './constants'
import PostCard from './post-card'
import { usePostPages } from '../../entities/post'


const SocialPage = () => {
  const session = useSession()
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [composing, setComposing] = useState(false)
  const listQuery = usePostPages(category, POST_PAGE_SIZE)
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const popular = [...items].sort((a, b) => b.viewCount - a.viewCount).slice(0, 3)
  const name = session?.user.displayName ?? ''
  return (
    <main className="page social-layout">
      <nav className="side" aria-label="소셜">
        {POST_CATEGORIES.map((item) => (
          <button key={item.label} type="button" className={category === item.key ? 'side-link on' : 'side-link'} onClick={() => setCategory(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="feed">
        <button type="button" className="box composer" onClick={() => setComposing(true)}>
          <span className="av" style={{ background: brandColor(name || 'Push') }}>
            {initials(name || '나')}
          </span>
          <span className="t3">{composerPrompt(session?.user.accountType === 'EMPLOYER', name)}</span>
          <span className="btn pri sm">{COMPOSER_ACTION}</span>
        </button>
        <div className="post-list">
          {items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {listQuery.isLoading ? <Skeleton rows={3} /> : null}
        {listQuery.isError ? (
          <div className="empty-block">
            <p className="b1 w7">{SOCIAL_ERROR}</p>
            <button type="button" className="btn sec" onClick={() => void listQuery.refetch()}>
              {SOCIAL_RETRY}
            </button>
          </div>
        ) : null}
        {!listQuery.isLoading && items.length === 0 ? <p className="b1 w7">{SOCIAL_EMPTY}</p> : null}
        {listQuery.hasNextPage ? (
          <button type="button" className="btn sec" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
            더 보기
          </button>
        ) : null}
      </div>
      <aside className="popular">
        <h2 className="h3">{POPULAR_TITLE}</h2>
        {popular.map((post) => {
          const label = POST_CATEGORIES.find((item) => item.key === post.category)?.label ?? post.category
          return (
            <Link key={post.id} to={`/posts/${post.id}`}>
              <span className="b2 w7">{post.title}</span>
              <span className="c1 t3">{`${label} · 조회 ${compactCount(post.viewCount)}`}</span>
            </Link>
          )
        })}
      </aside>
      {composing ? <ComposerSheet onClose={() => setComposing(false)} /> : null}
    </main>
  )
}

export default SocialPage
