import { POST_CATEGORIES, type Post } from '@push/api-client'
import { Link } from 'react-router-dom'
import { compactCount, relativeTime } from '../../shared/lib/format'
import { authorLabel } from './author-label'
import { EMPLOYER_BADGE } from './constants'

const PostCard = ({ post }: { post: Post }) => {
  const category = POST_CATEGORIES.find((item) => item.key === post.category)?.label ?? post.category
  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <span className="post-author">
        <span className="b2 w7">{authorLabel(post.author)}</span>
        {post.author.employer ? <span className="badge biz">{EMPLOYER_BADGE}</span> : null}
        <span className="c1 t3">{`${category} · ${relativeTime(post.createdAt)}`}</span>
      </span>
      <strong className="b1">{post.title}</strong>
      <p className="b2 t2 post-excerpt">{post.body}</p>
      <span className="c1 t3">{`댓글 ${compactCount(post.commentCount)} · 조회 ${compactCount(post.viewCount)}`}</span>
    </Link>
  )
}

export default PostCard
