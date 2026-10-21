import { POST_CATEGORIES } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { assetUrl } from '../../shared/api/client'
import { compactCount, relativeTime } from '../../shared/lib/format'
import { authorLabel, usePost, usePostComments } from '../../entities/post'
import CommentItem from './comment-item'
import { COMMENT_MAX, COMMENT_PLACEHOLDER, EMPLOYER_BADGE } from './constants'
import { postsComment } from '../../features/comment-on-post'


const PostPage = () => {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const postQuery = usePost(id)
  const commentsQuery = usePostComments(id)
  const [body, setBody] = useState('')
  const [parentId, setParentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const post = postQuery.data
  const comments = commentsQuery.data?.data ?? []
  const ready = body.trim().length >= 1 && body.trim().length <= COMMENT_MAX
  const send = useMutation({
    mutationFn: () => postsComment(id, body.trim(), parentId ?? undefined),
    onSuccess: async () => {
      setBody('')
      setParentId(null)
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['comments', id] })
      await queryClient.invalidateQueries({ queryKey: ['post', id] })
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => setError('댓글을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  if (postQuery.isError) return <main className="page"><p className="b2 t3">글을 불러오지 못했어요.</p></main>
  if (!post) return <main className="page" aria-busy="true" />
  const category = POST_CATEGORIES.find((item) => item.key === post.category)?.label ?? post.category
  return (
    <main className="page">
      <Link to="/social" className="back">
        소셜
      </Link>
      <article className="stack post-detail">
        <span className="post-author">
          <span className="b2 w7">{authorLabel(post.author)}</span>
          {post.author.employer ? <span className="badge biz">{EMPLOYER_BADGE}</span> : null}
          <span className="c1 t3">{`${category} · ${relativeTime(post.createdAt)} · 조회 ${compactCount(post.viewCount)}`}</span>
        </span>
        <h1 className="h2">{post.title}</h1>
        <p className="b1 post-body">{post.body}</p>
        {post.imageUrls.length > 0 ? (
          <div className="post-images">
            {post.imageUrls.map((url) => (
              <img key={url} src={assetUrl(url)} alt="" />
            ))}
          </div>
        ) : null}
      </article>
      <section className="stack">
        <h2 className="h3">{`댓글 ${comments.length}`}</h2>
        {comments.length === 0 ? <p className="b2 t3">아직 댓글이 없어요.</p> : null}
        <ul className="comment-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} onReply={setParentId} />
          ))}
        </ul>
        <label className="field">
          {parentId ? '답글' : '댓글'}
          <textarea value={body} maxLength={COMMENT_MAX} rows={4} placeholder={COMMENT_PLACEHOLDER} onChange={(event) => setBody(event.target.value)} />
          <span className="c1 t3">{`${body.length} / ${COMMENT_MAX}`}</span>
        </label>
        {parentId ? (
          <button type="button" className="text-link" onClick={() => setParentId(null)}>
            답글 취소
          </button>
        ) : null}
        {error ? <p className="auth-error">{error}</p> : null}
        <button type="button" className="primary" disabled={!ready || send.isPending} onClick={() => send.mutate()}>
          {parentId ? '답글 달기' : '댓글 달기'}
        </button>
      </section>
    </main>
  )
}

export default PostPage
