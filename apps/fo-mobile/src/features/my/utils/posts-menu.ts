import type { MenuSection } from '@/shared/components/menu-action'

export type PostsView = 'mine' | 'commented' | 'saved'
export type PostsSort = 'latest' | 'views' | 'comments'

// shortcut: saved posts and the views/comments sorts have no push-be endpoint (be-requests-r5.md); flip a flag once its endpoint ships and its fetcher is wired.
export const POSTS_SUPPORT: { view: Record<PostsView, boolean>; sort: Record<PostsSort, boolean> } = {
  view: { mine: true, commented: true, saved: false },
  sort: { latest: true, views: false, comments: false },
}

export const POSTS_VIEWS: { key: PostsView; label: string }[] = [
  { key: 'mine', label: '내가 쓴 글' },
  { key: 'commented', label: '댓글 단 글' },
  { key: 'saved', label: '저장한 글' },
]

export const POSTS_SORTS: { key: PostsSort; label: string }[] = [
  { key: 'latest', label: '최신순' },
  { key: 'views', label: '조회 많은 순' },
  { key: 'comments', label: '댓글 많은 순' },
]

export const postsTitle = (view: PostsView) => POSTS_VIEWS.find((v) => v.key === view)!.label

const section = <K extends string>(
  key: string,
  title: string,
  items: { key: K; label: string }[],
  supported: Record<K, boolean>,
  current: K,
  pick: (k: K) => void,
): MenuSection => ({
  key,
  title,
  actions: items.filter((i) => supported[i.key]).map((i) => ({ key: i.key, label: i.label, selected: i.key === current, onPress: () => pick(i.key) })),
})

/** ⋯ menu of the full posts list: 보기 and 정렬, each with a check on the current pick. Unsupported choices are hidden, and a group with fewer than two left is not a choice, so it is hidden too. */
export const postsMenu = (
  state: { view: PostsView; sort: PostsSort },
  on: { view: (v: PostsView) => void; sort: (s: PostsSort) => void },
  support = POSTS_SUPPORT,
): MenuSection[] =>
  [
    section('view', '보기', POSTS_VIEWS, support.view, state.view, on.view),
    section('sort', '정렬', POSTS_SORTS, support.sort, state.sort, on.sort),
  ].filter((s) => s.actions.length > 1)
