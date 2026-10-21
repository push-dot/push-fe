import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api'
import { brandOf, compactCount, initials } from '../../format'
import { useSession } from '../../shared/auth/use-session'
import ComposerSheet from './composer-sheet'
import { COMPOSER_ACTION, COMPOSER_PROMPT, POPULAR_TITLE, POST_PAGE_SIZE } from './constants'
import PostCard from './post-card'

const SocialPage = () => {
  const session = useSession()
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [composing, setComposing] = useState(false)
  const listQuery = useInfiniteQuery({
    queryKey: ['posts', category],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.posts.list(category, { cursor: pageParam, limit: POST_PAGE_SIZE }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })
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
          <span className="av" style={{ background: brandOf(name || 'Push') }}>
            {initials(name || '나')}
          </span>
          <span className="t3">{COMPOSER_PROMPT}</span>
          <span className="btn pri sm">{COMPOSER_ACTION}</span>
        </button>
        <div className="post-list">
          {items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {listQuery.isError ? <p className="b2 t3">글을 불러오지 못했어요.</p> : null}
        {!listQuery.isLoading && items.length === 0 ? <p className="b2 t3">아직 글이 없어요.</p> : null}
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
