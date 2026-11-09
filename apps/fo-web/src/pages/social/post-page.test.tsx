import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PostPage from './post-page'

const state = vi.hoisted(() => ({ post: {} as Record<string, unknown>, comments: {} as Record<string, unknown> }))

vi.mock('../../entities/post', () => ({
  authorLabel: () => '김서준',
  usePost: () => state.post,
  usePostComments: () => state.comments,
}))
vi.mock('./use-viewer-author', () => ({ useViewerAuthor: () => null }))

const post = {
  id: 'p1',
  category: 'dev',
  title: '정산 배치 이야기',
  body: '본문',
  imageUrls: [],
  author: { employer: false },
  createdAt: '2026-11-01T00:00:00.000Z',
  viewCount: 10,
  commentCount: 4,
}

const render = (postState: Record<string, unknown>, comments: Record<string, unknown>) => {
  state.post = { isError: false, refetch: () => undefined, ...postState }
  state.comments = { isLoading: false, isError: false, isSuccess: false, refetch: () => undefined, ...comments }
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/social/p1']}>
        <Routes>
          <Route path="/social/:id" element={<PostPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PostPage states', () => {
  it('shows the load-fail page with 다시 시도 when the post fails', () => {
    const html = render({ isError: true }, {})
    expect(html).toContain('페이지를 불러오지 못했어요')
    expect(html).toContain('다시 시도')
  })

  it('shows a skeleton while the post loads', () => {
    expect(render({}, {})).toContain('aria-busy="true"')
  })

  it('does not say there are no comments while they load or after they fail', () => {
    const loading = render({ data: post }, { isLoading: true })
    expect(loading).not.toContain('아직 댓글이 없어요')
    expect(loading).toContain('댓글 4')
    const failed = render({ data: post }, { isError: true })
    expect(failed).not.toContain('아직 댓글이 없어요')
    expect(failed).toContain('댓글을 불러오지 못했어요')
  })

  it('says there are no comments after an empty answer', () => {
    expect(render({ data: post }, { isSuccess: true, data: { data: [] } })).toContain('아직 댓글이 없어요')
  })
})
