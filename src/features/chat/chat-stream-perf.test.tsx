import { act, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Operation } from '@/shared/api'

const h = vi.hoisted(() => ({
  markdownCalls: [] as number[],
}))

vi.mock('./api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
    streamActive: vi.fn(),
  }
})

vi.mock('react-markdown', async () => {
  const Markdown = ({ children }: { children?: ReactNode }) => {
    h.markdownCalls.push(typeof children === 'string' ? children.length : 0)
    return <div className="chat-md">{children}</div>
  }
  return { default: Markdown }
})

import { streamMessage } from './api/fetchers'
import type { Message } from './api/schemas'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from './stores'
import ChatStream from './components/chat-stream'

const ROW_HEIGHT = 120
const VIEW_HEIGHT = 500
const TOTAL_MESSAGES = 1000
const PREPEND_COUNT = 50
const BASE_MESSAGES = 100
const STREAM_TOKENS = 500
const TOKEN_GAP_MS = 2

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

const mockLayout = (list: HTMLDivElement, scrollHeight: number) => {
  Object.defineProperty(list, 'scrollTop', {
    value: 0,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(list, 'scrollHeight', {
    value: scrollHeight,
    configurable: true,
  })
}

const operation = (): Operation => ({
  id: 'op1',
  type: 'CHAT_MESSAGE',
  applicationId: null,
  status: 'SUCCEEDED',
  progress: null,
  result: {
    kind: 'CHAT_MESSAGE',
    value: {
      userMessage: {
        id: 'u1',
        conversationId: 'c1',
        role: 'USER',
        text: 'hello',
        attachments: [],
        operationId: null,
        createdAt: '2026-09-01T00:00:00Z',
      },
      assistantMessage: {
        id: 'a1',
        conversationId: 'c1',
        role: 'ASSISTANT',
        text: 'x'.repeat(STREAM_TOKENS),
        attachments: [],
        operationId: null,
        createdAt: '2026-09-01T00:00:00Z',
      },
      approvalIds: [],
    },
  },
  error: null,
  inputRequest: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

const enableAi = () => {
  useInferenceSettings.setState({
    models: [
      {
        provider: 'OPENAI',
        model: 'm',
        credentialMode: 'MANAGED',
        available: true,
      },
    ] as never,
    modelsStatus: 'success',
    accessMode: 'SUGGEST',
  } as never)
}

const Harness = () => {
  const messages = useMessagesStore((s) => s.messages)
  const sendStatus = useMessagesStore((s) => s.sendStatus)
  return <ChatStream messages={messages} status="success" sendStatus={sendStatus} />
}

describe('chat stream perf metrics', () => {
  let spies: { mockRestore: () => void }[] = []

  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
    h.markdownCalls.length = 0
    spies = [
      vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockReturnValue(ROW_HEIGHT),
      vi
        .spyOn(HTMLElement.prototype, 'clientHeight', 'get')
        .mockReturnValue(VIEW_HEIGHT),
    ]
  })

  afterEach(() => {
    for (const s of spies) s.mockRestore()
    spies = []
  })

  it('mounted row nodes for 1,000 messages', () => {
    const { container } = render(
      <ChatStream
        messages={seededMessages(TOTAL_MESSAGES)}
        status="success"
        sendStatus="idle"
      />,
    )
    const mounted = container.querySelectorAll('.chat-stream-row').length
    console.log(
      JSON.stringify({ scenario: 'mount-1000', mountedRows: mounted, total: TOTAL_MESSAGES }),
    )
    expect(mounted).toBeGreaterThan(0)
  })

  it('scroll position error after prepend', () => {
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
    const list = container.querySelector<HTMLDivElement>('.chat-vlist')
    if (!list) throw new Error('chat-vlist missing')
    mockLayout(list, BASE_MESSAGES * ROW_HEIGHT)
    const startTop = 20 * ROW_HEIGHT
    list.scrollTop = startTop
    act(() => {
      fireEvent.scroll(list)
    })
    const prepended = [...seededMessages(PREPEND_COUNT, 'p'), ...base]
    Object.defineProperty(list, 'scrollHeight', {
      value: prepended.length * ROW_HEIGHT,
      configurable: true,
    })
    rerender(
      <ChatStream
        messages={prepended}
        status="success"
        sendStatus="idle"
        hasMore
        onTopReached={() => {}}
      />,
    )
    const expected = startTop + PREPEND_COUNT * ROW_HEIGHT
    const errorPx = Math.abs(list.scrollTop - expected)
    console.log(
      JSON.stringify({
        scenario: 'prepend-anchor',
        expectedScrollTop: expected,
        actualScrollTop: list.scrollTop,
        errorPx,
      }),
    )
    expect(list.scrollTop).toBeGreaterThan(0)
  })

  it('markdown parse calls for a 500-token stream', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (let i = 0; i < STREAM_TOKENS; i++) {
        yield { type: 'token', text: i % 50 === 49 ? '\n\n' : 'w ' }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation() }
    } as never)

    const startedAt = performance.now()
    render(<Harness />)
    await act(async () => {
      await useMessagesStore.getState().send('c1', 'hello')
    })
    const elapsedMs = performance.now() - startedAt
    const parsedChars = h.markdownCalls.reduce((a, b) => a + b, 0)
    console.log(
      JSON.stringify({
        scenario: 'stream-500',
        tokens: STREAM_TOKENS,
        elapsedMs: Math.round(elapsedMs),
        markdownCalls: h.markdownCalls.length,
        parsedChars,
      }),
    )
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
  })
})
