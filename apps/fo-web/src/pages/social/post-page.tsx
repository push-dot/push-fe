import { POST_CATEGORIES, type Comment } from '@push/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { authorLabel, usePost, usePostComments } from '../../entities/post'
import { postsComment } from '../../features/comment-on-post'
import { assetUrl } from '../../shared/api/client'
import { compactCount, relativeTime } from '../../shared/lib/format'
import { Icon } from '../../shared/ui/icon'
import { LoadFail } from '../../shared/ui/page-state'
import { Menu, Popover, type MenuItem } from '../../shared/ui/popover'
import Skeleton from '../../shared/ui/skeleton'
import { ErrorState } from '../../shared/ui/state-block'
import Toast, { useToast } from '../../shared/ui/toast'
import AuthorAvatar from './author-avatar'
import CommentItem from './comment-item'
import { COMMENT_EMPTY, COMMENT_ERROR, COMMENT_MAX, COMMENT_PLACEHOLDER, LINK_COPIED, SOCIAL_TITLE } from './constants'
import EmployerBadge from './employer-badge'
import ReplyRow from './reply-row'
import { threadComments } from './thread-comments'
import { useViewerAuthor } from './use-viewer-author'

type ReplyTarget = { rootId: string; name: string }

const PostPage = () => {
  const { id = '' } = useParams()
  const queryClient = useQueryClient()
  const postQuery = usePost(id)
  const commentsQuery = usePostComments(id)
  const viewer = useViewerAuthor()
  const { message, show } = useToast()
  const [body, setBody] = useState('')
  const [replyText, setReplyText] = useState('')
  const [reply, setReply] = useState<ReplyTarget | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const post = postQuery.data
  const comments = commentsQuery.data?.data ?? []
  const ready = body.trim().length >= 1 && body.trim().length <= COMMENT_MAX
  const send = useMutation({
    mutationFn: (input: { text: string; parentId?: string }) => postsComment(id, input.text, input.parentId),
    onSuccess: async (_created, input) => {
      if (input.parentId) {
        setReplyText('')
        setReply(null)
      } else setBody('')
      setError(null)
      await queryClient.invalidateQueries({ queryKey: ['comments', id] })
      await queryClient.invalidateQueries({ queryKey: ['post', id] })
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
    onError: () => setError('댓글을 올리지 못했어요. 잠시 후 다시 시도해 주세요.'),
  })
  const startReply = (root: Comment, target: Comment) => {
    setReply({ rootId: root.id, name: authorLabel(target.author) })
    setReplyText('')
  }
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    show(LINK_COPIED)
  }
  const share = async () => {
    if (typeof navigator.share !== 'function') return copyLink()
    try {
      await navigator.share({ url: window.location.href, title: post?.title })
    } catch {
      return
    }
  }
  if (postQuery.isError && !post) return <LoadFail onRetry={() => void postQuery.refetch()} />
  if (!post)
    return (
      <main className="page post-page">
        <Skeleton rows={5} />
      </main>
    )
  const category = POST_CATEGORIES.find((item) => item.key === post.category)?.label ?? post.category
  const items: MenuItem[] = [
    { label: '공유하기', icon: 'share', onSelect: () => void share() },
    { label: '링크 복사', icon: 'link', onSelect: () => void copyLink() },
  ]
  return (
    <main className="page post-page">
      <Link to="/social" className="back b2">
        <Icon name="back" size={18} width={2.2} />
        {SOCIAL_TITLE}
      </Link>
      <article className="post-detail">
        <header className="post-top">
          <AuthorAvatar author={post.author} size={48} />
          <span className="post-who">
            <span className="b1 w7 post-name">
              {authorLabel(post.author)}
              {post.author.employer ? <EmployerBadge /> : null}
            </span>
            <span className="c1 t3">{`${category} · ${relativeTime(post.createdAt)} · 조회 ${compactCount(post.viewCount)}`}</span>
          </span>
          <div className="post-more">
            <button type="button" className="hbtn" aria-label="더 보기" aria-haspopup="menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
              <Icon name="more" size={22} width={2.4} />
            </button>
            {menuOpen ? (
              <Popover label="글 메뉴" className="post-pop" onClose={() => setMenuOpen(false)}>
                <Menu items={items} onClose={() => setMenuOpen(false)} />
              </Popover>
            ) : null}
          </div>
        </header>
        <h1 className="h1">{post.title}</h1>
        <p className="b1 t2 post-body">{post.body}</p>
        {post.imageUrls.length > 0 ? (
          <div className="post-images">
            {post.imageUrls.map((url) => (
              <img key={url} src={assetUrl(url)} alt="" />
            ))}
          </div>
        ) : null}
      </article>
      <section className="post-comments">
        <h2 className="h3">{`댓글 ${commentsQuery.data ? comments.length : post.commentCount}`}</h2>
        {commentsQuery.isLoading ? <Skeleton rows={2} /> : null}
        {commentsQuery.isError && comments.length === 0 ? <ErrorState title={COMMENT_ERROR} onRetry={() => void commentsQuery.refetch()} /> : null}
        {commentsQuery.isSuccess && comments.length === 0 ? <p className="b2 t3">{COMMENT_EMPTY}</p> : null}
        <div className="comment-list">
          {threadComments(comments).map(({ root, replies }) => (
            <div key={root.id}>
              <CommentItem comment={root} active={reply?.rootId === root.id} onReply={() => startReply(root, root)} />
              {replies.map((item) => (
                <CommentItem key={item.id} comment={item} reply onReply={() => startReply(root, item)} />
              ))}
              {reply?.rootId === root.id ? (
                <ReplyRow
                  viewer={viewer}
                  target={reply.name}
                  text={replyText}
                  pending={send.isPending}
                  onChange={setReplyText}
                  onCancel={() => setReply(null)}
                  onSubmit={() => send.mutate({ text: `@${reply.name} ${replyText.trim()}`, parentId: root.id })}
                />
              ) : null}
            </div>
          ))}
        </div>
        <form
          className="comment-pill"
          onSubmit={(event) => {
            event.preventDefault()
            if (ready && !send.isPending) send.mutate({ text: body.trim() })
          }}
        >
          <input className="b1" aria-label="댓글" value={body} maxLength={COMMENT_MAX} placeholder={COMMENT_PLACEHOLDER} onChange={(event) => setBody(event.target.value)} />
          <button type="submit" className={ready ? 'hbtn on' : 'hbtn'} aria-label="보내기" disabled={!ready || send.isPending}>
            <Icon name="arrowUp" size={20} width={2.4} />
          </button>
        </form>
        {error ? <p className="auth-error">{error}</p> : null}
      </section>
      <Toast message={message} />
    </main>
  )
}

export default PostPage
