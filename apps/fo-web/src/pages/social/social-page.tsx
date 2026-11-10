import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePostPages, authorLabel } from '../../entities/post'
import { composerPrompt } from '../../features/compose-post'
import { compactCount } from '../../shared/lib/format'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import AuthorAvatar from './author-avatar'
import ComposerSheet from './composer-sheet'
import { COMPOSER_ACTION, POPULAR_TITLE, POST_PAGE_SIZE, SOCIAL_EMPTY, SOCIAL_ERROR, SOCIAL_RETRY, SOCIAL_TITLE } from './constants'
import PostCard from './post-card'
import { usePopularPosts } from './popular-posts'
import { useViewerAuthor } from './use-viewer-author'

const categoryLabel = (key: PostCategory) => POST_CATEGORIES.find((item) => item.key === key)?.label ?? key

const SocialPage = () => {
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [composing, setComposing] = useState(false)
  const listQuery = usePostPages(category, POST_PAGE_SIZE)
  const popular = usePopularPosts().data ?? []
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  const viewer = useViewerAuthor()
  const empty = !listQuery.isLoading && !listQuery.isError && items.length === 0
  return (
    <main className="page social-layout">
      <div className="social-side">
        <h1 className="h1">{SOCIAL_TITLE}</h1>
        <nav className="social-cats" aria-label="소셜 카테고리">
          {POST_CATEGORIES.map((item) => (
            <button key={item.label} type="button" className={category === item.key ? 'side-link on' : 'side-link'} aria-pressed={category === item.key} onClick={() => setCategory(item.key)}>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="feed social-feed">
        {empty ? null : (
          <button type="button" className="box composer" onClick={() => setComposing(true)}>
            <AuthorAvatar author={viewer} size={40} />
            <span className="b1 t4 composer-prompt">{composerPrompt(viewer.employer === true, authorLabel(viewer))}</span>
            <span className="btn pri sm">{COMPOSER_ACTION}</span>
          </button>
        )}
        <div className="post-list">
          {items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
        {listQuery.isLoading ? <Skeleton rows={3} /> : null}
        {listQuery.isError ? <ErrorState title={SOCIAL_ERROR} retryLabel={SOCIAL_RETRY} onRetry={() => void listQuery.refetch()} /> : null}
        {empty ? (
          <StateBlock
            icon="pencil"
            title={SOCIAL_EMPTY}
            action={
              <button type="button" className="btn pri sm" onClick={() => setComposing(true)}>
                {COMPOSER_ACTION}
              </button>
            }
          />
        ) : null}
        {listQuery.hasNextPage ? (
          <button type="button" className="btn sec" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
            더 보기
          </button>
        ) : null}
      </div>
      {popular.length > 0 ? (
        <aside className="popular card">
          <h2 className="b2 w7">{POPULAR_TITLE}</h2>
          {popular.map((post) => (
            <Link key={post.id} to={`/posts/${post.id}`} className="popular-row">
              <span className="b2 cap">{post.title}</span>
              <span className="c1 t3">{`${categoryLabel(post.category)} · 조회 ${compactCount(post.viewCount)}`}</span>
            </Link>
          ))}
        </aside>
      ) : null}
      {composing ? <ComposerSheet initialCategory={category} onClose={() => setComposing(false)} /> : null}
    </main>
  )
}

export default SocialPage
