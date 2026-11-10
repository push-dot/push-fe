import { describe, expect, it } from 'vitest'
import type { ConversationListItem } from '../types'

// Field names from push-be gateway conversationJson (GET /conversations).
const row = {
  id: 'c1',
  revision: 1,
  applicationId: null,
  title: '면접',
  pinned: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  status: 'RUNNING',
  queuePosition: 3,
  lastLine: '이력서 읽기 · 김서준_이력서.pdf',
  lastMessagePreview: 'still going',
  createdBy: { displayName: 'Ada' },
  postingId: null,
} satisfies ConversationListItem

describe('ConversationListItem', () => {
  it('keeps the fields GET /conversations returns', () => {
    expect(row).toMatchObject({
      status: 'RUNNING',
      queuePosition: 3,
      lastLine: '이력서 읽기 · 김서준_이력서.pdf',
      lastMessagePreview: 'still going',
      createdBy: { displayName: 'Ada' },
      postingId: null,
    })
  })
})
