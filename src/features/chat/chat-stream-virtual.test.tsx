import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
    streamActive: vi.fn(),
  }
})

import type { Message } from './api/schemas'
import ChatStream from './components/chat-stream'

const ROW_HEIGHT = 120
const VIEW_HEIGHT = 500
const TOTAL_MESSAGES = 1000
const BASE_MESSAGES = 100
const PREPEND_COUNT = 50

const seededMessages = (count: number, prefix = 'm'): Message[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i}`,
    conversationId: 'c1',
    role: 'ASSISTANT',
    text: `message ${prefix}${i}`,
    attachments: [],
    operationId: null,
    createdAt: '2026-09-01T00:00:00Z',
  }))

const findList = (container: HTMLElement) => {
  const list = container.querySelector<HTMLDivElement>('.chat-vlist')
  if (!list) throw new Error('chat-vlist missing')
  return list
}

const mockScroll = (list: HTMLDivElement, scrollHeight: number, top = 0) => {
  Object.defineProperty(list, 'scrollTop', {
    value: top,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(list, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  })
}

describe('chat stream virtualization', () => {
  const spies: { mockRestore: () => void }[] = []

  beforeEach(() => {
    spies.push(
      vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockReturnValue(ROW_HEIGHT),
      vi
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(VIEW_HEIGHT),
    )
  })

  afterEach(() => {
    while (spies.length) spies.pop()?.mockRestore()
  })

  it('mounts only the visible window for 1,000 messages', () => {
    const { container } = render(
      <ChatStream
        messages={seededMessages(TOTAL_MESSAGES)}
        status="success"
        sendStatus="idle"
      />,
    )
    const mounted = container.querySelectorAll('.chat-stream-row').length
    expect(mounted).toBeLessThan(TOTAL_MESSAGES / 5)
    expect(mounted).toBeGreaterThan(0)
  })

  it('keeps the first visible message anchored after prepend', () => {
    const base = seededMessages(BASE_MESSAGES)
    const { container, rerender } = render(
      <ChatStream
        messages={base}
        status="success"
        sendStatus="idle"
        hasMore
        onTopReached={() => {}}
      />,
    )
    const list = findList(container)
    mockScroll(list, BASE_MESSAGES * ROW_HEIGHT)
    const startTop = 20 * ROW_HEIGHT
    list.scrollTop = startTop
    act(() => {
      fireEvent.scroll(list)
    })
    expect(container.textContent).toContain('message m20')

    const prepended = [...seededMessages(PREPEND_COUNT, 'p'), ...base]
    mockScroll(list, prepended.length * ROW_HEIGHT, startTop)
    rerender(
      <ChatStream
        messages={prepended}
        status="success"
        sendStatus="idle"
        hasMore
        onTopReached={() => {}}
      />,
    )

    expect(list.scrollTop).toBe(startTop + PREPEND_COUNT * ROW_HEIGHT)
    expect(container.textContent).toContain('message m20')
  })

  it('renders the tail rows when scrolled to the bottom', () => {
    const { container } = render(
      <ChatStream
        messages={seededMessages(TOTAL_MESSAGES)}
        status="success"
        sendStatus="idle"
      />,
    )
    const list = findList(container)
    mockScroll(list, TOTAL_MESSAGES * ROW_HEIGHT)
    list.scrollTop = TOTAL_MESSAGES * ROW_HEIGHT - VIEW_HEIGHT
    act(() => {
      fireEvent.scroll(list)
    })
    expect(container.textContent).toContain(`message m${TOTAL_MESSAGES - 1}`)
  })
})
