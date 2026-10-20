import { POST_CATEGORIES, type Post } from '@push/api-client'
import { Link } from 'react-router-dom'

const postedAt = (iso: string) => {
  const date = new Date(iso)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

const PostCard = ({ post }: { post: Post }) => {
  const category = POST_CATEGORIES.find((item) => item.key === post.category)?.label ?? post.category
  const name = post.author.employer ? post.author.companyName : post.author.displayName
  return (
    <Link to={`/posts/${post.id}`} className="post-card">
      <span className="post-author">
        <span className="b2 w7">{name}</span>
        {post.author.employer ? <span className="badge grey">기업</span> : null}
        <span className="c1 t3">{category}</span>
      </span>
      <strong className="b1">{post.title}</strong>
      <p className="b2 t2 post-excerpt">{post.body}</p>
      <span className="c1 t3">{`댓글 ${post.commentCount} · ${postedAt(post.createdAt)}`}</span>
    </Link>
  )
}

export default PostCard
