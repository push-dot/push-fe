import type { Posting } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { api, assetUrl } from '../../api'
import { brandOf, careerLabel } from '../../format'
import { saveReturnTo } from '../../shared/auth/return-path'
import { useSession } from '../../shared/auth/use-session'

const PostingCard = ({ posting }: { posting: Posting }) => {
  const session = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const bookmark = useMutation({
    mutationFn: () => (posting.bookmarked ? api.postings.unbookmark(posting.id) : api.postings.bookmark(posting.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['postings'] })
      await queryClient.invalidateQueries({ queryKey: ['posting', posting.id] })
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
  return (
    <article className="posting-card">
      <button
        type="button"
        className="bookmark"
        aria-pressed={posting.bookmarked}
        aria-label="북마크"
        disabled={bookmark.isPending}
        onClick={onBookmark}
      >
        <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" />
        </svg>
      </button>
      <Link to={`/postings/${posting.id}`} className="posting-card-body">
        <div className="posting-photo" style={{ background: posting.imageUrl ? undefined : brandOf(posting.company) }}>
          {posting.imageUrl ? <img src={assetUrl(posting.imageUrl)} alt="" /> : <span>{[...posting.company][0]}</span>}
        </div>
        <div className="posting-copy">
          <span className="c1 t3">{posting.company}</span>
          <strong className="posting-title">{posting.title}</strong>
          <span className="c1 t2">
            {posting.location} · {careerLabel(posting.careerMin, posting.careerMax)}
          </span>
        </div>
      </Link>
    </article>
  )
}

export default PostingCard
