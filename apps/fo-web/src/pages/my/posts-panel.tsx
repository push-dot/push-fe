import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useMyCommentedPosts, useMyPosts } from '../../entities/post'
import { Icon } from '../../shared/ui/icon'
import { LOAD_FAIL } from '../../shared/ui/page-state'
import { Popover } from '../../shared/ui/popover'
import Skeleton from '../../shared/ui/skeleton'
import StateBlock, { ErrorState } from '../../shared/ui/state-block'
import { ACTIVITY_LOAD_ERROR, COMMENTED_EMPTY, POST_EMPTY, POST_EMPTY_ACTION, POST_EMPTY_SUB, POSTS_VIEW_LABEL, POSTS_VIEWS, listTotal } from './constants'
import MyPostRow from './my-post-row'

type PostsView = (typeof POSTS_VIEWS)[number]['key']

const PostsPanel = () => {
  const [view, setView] = useState<PostsView>('mine')
  const [menu, setMenu] = useState(false)
  const mine = useMyPosts(view === 'mine')
  const commented = useMyCommentedPosts(view === 'commented')
  const query = view === 'mine' ? mine : commented
  const label = POSTS_VIEWS.find((item) => item.key === view)?.label
  const posts = query.data?.data ?? []
  return (
    <>
      <div className="posts-head">
        <span className="b2 w7">
          {label} <span className="t3 num">{query.data ? listTotal(query.data) : ''}</span>
        </span>
        <button type="button" className={menu ? 'hbtn on' : 'hbtn'} aria-label={POSTS_VIEW_LABEL} aria-expanded={menu} onClick={() => setMenu((open) => !open)}>
          <Icon name="more" size={22} />
        </button>
        {menu ? (
          <Popover label={POSTS_VIEW_LABEL} onClose={() => setMenu(false)} className="posts-pop">
            <div className="c1 w7 t3 posts-pop-label">{POSTS_VIEW_LABEL}</div>
            <div className="menu" role="menu">
              {POSTS_VIEWS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitemradio"
                  aria-checked={view === item.key}
                  className={view === item.key ? 'mi on' : 'mi'}
                  onClick={() => {
                    setView(item.key)
                    setMenu(false)
                  }}
                >
                  <span>{item.label}</span>
                  {view === item.key ? <Icon name="check" size={20} width={2.4} className="ac" /> : null}
                </button>
              ))}
            </div>
          </Popover>
        ) : null}
      </div>
      {query.isLoading ? <Skeleton rows={3} /> : null}
      {query.isError ? <ErrorState boxed title={ACTIVITY_LOAD_ERROR} description={LOAD_FAIL.body} onRetry={() => void query.refetch()} /> : null}
      {query.data && posts.length === 0 && view === 'mine' ? (
        <StateBlock
          boxed
          icon="chat"
          title={POST_EMPTY}
          description={POST_EMPTY_SUB}
          action={
            <Link to="/social" className="btn pri sm">
              <Icon name="pencil" size={16} width={2.2} />
              {POST_EMPTY_ACTION}
            </Link>
          }
        />
      ) : null}
      {query.data && posts.length === 0 && view === 'commented' ? <StateBlock boxed icon="chat" title={COMMENTED_EMPTY} /> : null}
      {posts.length > 0 ? (
        <ul className="my-posts">
          {posts.map((post) => (
            <MyPostRow key={post.id} post={post} />
          ))}
        </ul>
      ) : null}
    </>
  )
}

export default PostsPanel
