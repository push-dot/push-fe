import { POST_CATEGORIES, type PostCategory } from '@push/api-client'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '../../api'
import ComposerSheet from './composer-sheet'
import { POST_PAGE_SIZE } from './constants'
import PostCard from './post-card'

const SocialPage = () => {
  const [category, setCategory] = useState<PostCategory | null>(null)
  const [composing, setComposing] = useState(false)
  const listQuery = useInfiniteQuery({
    queryKey: ['posts', category],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => api.posts.list(category, { cursor: pageParam, limit: POST_PAGE_SIZE }),
    getNextPageParam: (last) => (last.page.hasMore ? (last.page.nextCursor ?? undefined) : undefined),
  })
  const items = listQuery.data?.pages.flatMap((page) => page.data) ?? []
  return (
    <main className="page">
      <header className="head social-head">
        <h1 className="h1">소셜</h1>
        <button type="button" className="primary slim" onClick={() => setComposing(true)}>
          새 글
        </button>
      </header>
      <div className="chips">
        {POST_CATEGORIES.map((item) => (
          <button key={item.label} type="button" className="chip" aria-pressed={category === item.key} onClick={() => setCategory(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="post-list">
        {items.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {listQuery.isError ? <p className="b2 t3">글을 불러오지 못했어요.</p> : null}
      {!listQuery.isLoading && items.length === 0 ? <p className="b2 t3">아직 글이 없어요.</p> : null}
      {listQuery.hasNextPage ? (
        <button type="button" className="more" disabled={listQuery.isFetchingNextPage} onClick={() => void listQuery.fetchNextPage()}>
          더 보기
        </button>
      ) : null}
      {composing ? <ComposerSheet onClose={() => setComposing(false)} /> : null}
    </main>
  )
}

export default SocialPage
