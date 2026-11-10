import type { Post } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PostCard from './post-card'

const post = { id: 'p1', category: 'dev', title: '제목', body: '본문', imageUrls: [], author: { displayName: '김서준', employer: false }, createdAt: '2026-11-01T00:00:00.000Z', commentCount: 3 } as unknown as Post

describe('PostCard', () => {
  it('names the comment count for screen readers', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <PostCard post={post} />
      </MemoryRouter>,
    )
    expect(html).toMatch(/<span class="sr-only">댓글<\/span>3/)
  })
})
