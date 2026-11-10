import type { ConversationListItem } from '@push/api-client'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ChatSide from './chat-side'

const row = (patch: Partial<ConversationListItem>): ConversationListItem => ({
  id: 'c1',
  revision: 1,
  applicationId: null,
  title: '면접 질문',
  pinned: false,
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
  status: 'DONE',
  queuePosition: null,
  lastLine: null,
  lastMessagePreview: '',
  createdBy: { displayName: '이민아' },
  postingId: null,
  ...patch,
})

const html = (conversation: ConversationListItem) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ChatSide conversations={[conversation]} loading={false} failed={false} usage={null} />
    </MemoryRouter>,
  )

describe('chat list row', () => {
  it('shows a running job and its last line', () => {
    const markup = html(
      row({ status: 'RUNNING', lastLine: '이력서 읽기 · 김서준_이력서.pdf', queuePosition: 3 }),
    )
    expect(markup).toContain('작업 중')
    expect(markup).toContain('badge ac')
    expect(markup).toContain('이력서 읽기 · 김서준_이력서.pdf')
    expect(markup).not.toContain('이민아')
  })

  it('shows 확인 필요 for a pending approval', () => {
    const markup = html(
      row({ status: 'NEEDS_APPROVAL', lastLine: '이 공고에 지원해요', postingId: 'p1' }),
    )
    expect(markup).toContain('확인 필요')
    expect(markup).toContain('badge orange')
    expect(markup).toContain('이 공고에 지원해요')
  })

  it('draws a finished chat with its title and no status mark or blank last line', () => {
    const markup = html(row({ status: 'DONE', lastLine: null }))
    expect(markup).toContain('면접 질문')
    expect(markup).not.toContain('badge')
    expect(markup).not.toContain('작업 중')
    expect(markup).not.toContain('확인 필요')
  })
})
