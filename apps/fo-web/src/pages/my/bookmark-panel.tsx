import { useBookmarks } from '../../entities/posting'
import { LOAD_FAIL } from '../../shared/ui/page-state'
import { CardSkeletons } from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import PostingCard from '../jobs/posting-card'
import { ACTIVITY_LOAD_ERROR, BOOKMARK_EMPTY, BOOKMARK_EMPTY_SUB, bookmarkCount, listTotal } from './constants'

const BookmarkPanel = () => {
  const query = useBookmarks()
  if (query.isLoading) return <CardSkeletons count={3} />
  if (query.isError || !query.data) return <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} />
  if (query.data.data.length === 0) return <StateBlock boxed icon="bookmark" title={BOOKMARK_EMPTY} description={BOOKMARK_EMPTY_SUB} />
  return (
    <>
      <p className="b2 t3 my-count">{bookmarkCount(listTotal(query.data))}</p>
      <div className="my-bookmarks">
        {query.data.data.map((posting) => (
          <PostingCard key={posting.id} posting={posting} />
        ))}
      </div>
    </>
  )
}

export default BookmarkPanel
