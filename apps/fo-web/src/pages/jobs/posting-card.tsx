import type { Posting } from '@push/api-client'
import { brandOf, careerLabel } from '@push/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'
import { postingsBookmark, postingsUnbookmark } from '../../features/bookmark-posting'


const PostingCard = ({ posting }: { posting: Posting }) => {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const bookmark = useMutation({
    mutationFn: () => (posting.bookmarked ? postingsUnbookmark(posting.id) : postingsBookmark(posting.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      await queryClient.invalidateQueries({ queryKey: ['posting', posting.id] })
      await queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })
  const onBookmark = () => {
    if (!session) {
      saveReturnTo(`/postings/${posting.id}`)
      navigate('/login')
      return
    }
    bookmark.mutate()
  }
  const letter = [...posting.company][0]
  return (
    <article className="jc">
      <div className="ph" style={{ background: posting.imageUrl ? undefined : brandOf(posting.company) }}>
        <Link to={`/postings/${posting.id}`} className="ph-hit">
          {posting.imageUrl ? <img src={assetUrl(posting.imageUrl)} alt="" /> : <b>{letter}</b>}
        </Link>
        <button
          type="button"
          className={posting.bookmarked ? 'bm on' : 'bm'}
          aria-pressed={posting.bookmarked}
          aria-label="북마크"
          disabled={bookmark.isPending}
          onClick={onBookmark}
        >
          <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" />
          </svg>
        </button>
      </div>
      <Link to={`/postings/${posting.id}`} className="jc-copy">
        <span className="c1 t3 w6">{posting.company}</span>
        <span className="b1 w7 cap">{posting.title}</span>
        <span className="c1 t3">
          {posting.location} · {careerLabel(posting)}
        </span>
      </Link>
    </article>
  )
}

export default PostingCard
