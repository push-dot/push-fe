import type { ConversationTurn, Message } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { EMPTY_TURN } from './chat-turn'
import { threadItems } from './chat-thread'

const message = (id: string, role: Message['role'], text: string): Message => ({
  id,
  conversationId: 'c1',
  role,
  text,
  attachments: [],
  operationId: null,
  createdAt: '',
})

const job = (
  jobId: string,
  userMessageId: string,
  assistantMessageId: string | null,
): ConversationTurn => ({
  jobId,
  status: 'DONE',
  createdAt: '',
  userMessageId,
  assistantMessageId,
  answer: null,
  events: [{ type: 'tool', name: 'read', state: 'ok', summary: '읽기' }],
})

// push-be pages messages newest first.
const newestFirst = (...messages: Message[]) => messages.reverse()

describe('threadItems', () => {
  it('reads a newest-first page oldest first', () => {
    const items = threadItems(
      newestFirst(message('m1', 'USER', '안녕'), message('m2', 'ASSISTANT', '안녕하세요')),
      [],
      null,
    )
    expect(items.map((item) => item.key)).toEqual(['m1', 'm2'])
  })

  it('replays a stored job in place of the assistant message it wrote', () => {
    const items = threadItems(
      newestFirst(message('m1', 'USER', '정리해 줘'), message('m2', 'ASSISTANT', '정리했어요')),
      [job('j1', 'm1', 'm2')],
      null,
    )
    expect(items.map((item) => item.kind)).toEqual(['user', 'turn'])
  })

  it('keeps a plain reply when no job was stored for it', () => {
    const items = threadItems(
      newestFirst(message('m1', 'USER', '안녕'), message('m2', 'ASSISTANT', '안녕하세요')),
      [],
      null,
    )
    expect(items.map((item) => item.kind)).toEqual(['user', 'reply'])
  })

  it('shows a job waiting on a card under its question', () => {
    const items = threadItems([message('m1', 'USER', '옮겨 줘')], [job('j1', 'm1', null)], null)
    expect(items.map((item) => item.kind)).toEqual(['user', 'turn'])
  })

  it('lets the live turn replace the messages stored since it began', () => {
    const items = threadItems(
      newestFirst(
        message('m1', 'USER', '처음'),
        message('m2', 'ASSISTANT', '네'),
        message('m3', 'USER', '다시'),
        message('m4', 'ASSISTANT', '다시 했어요'),
      ),
      [],
      { text: '다시', attachments: [], turn: EMPTY_TURN, known: ['m1', 'm2'] },
    )
    expect(items.map((item) => [item.kind, item.key])).toEqual([
      ['user', 'm1'],
      ['reply', 'm2'],
      ['user', 'live-user'],
      ['turn', 'live-turn'],
    ])
  })

  it('keeps an earlier message with the same text while the same text streams again', () => {
    const items = threadItems(
      newestFirst(
        message('m1', 'USER', '다시'),
        message('m2', 'ASSISTANT', '네'),
        message('m3', 'USER', '그다음'),
        message('m4', 'ASSISTANT', '좋아요'),
        message('m5', 'USER', '다시'),
      ),
      [],
      { text: '다시', attachments: [], turn: EMPTY_TURN, known: ['m1', 'm2', 'm3', 'm4'] },
    )
    expect(items.map((item) => item.key)).toEqual(['m1', 'm2', 'm3', 'm4', 'live-user', 'live-turn'])
  })

  it('appends a card answer without a question bubble', () => {
    const items = threadItems([message('m1', 'USER', '옮겨 줘')], [job('j1', 'm1', null)], {
      text: '',
      attachments: [],
      turn: EMPTY_TURN,
      known: ['m1'],
    })
    expect(items.map((item) => item.key)).toEqual(['m1', 'j1', 'live-turn'])
  })
})
