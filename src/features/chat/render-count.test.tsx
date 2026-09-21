import { Profiler } from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Operation } from '@/shared/api'
import { getRenderCount, resetRenderCounts } from '@/test-utils'

const h = vi.hoisted(() => ({ rowPrefix: 'row-' }))

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
  const { bumpRenderCount } = await import('@/test-utils')
  const Markdown = ({ children }: { children?: ReactNode }) => {
    bumpRenderCount(
      typeof children === 'string' && children.startsWith(h.rowPrefix)
        ? 'row'
        : 'stream',
    )
    return <div className="chat-md">{children}</div>
  }
  return { default: Markdown }
})

import { streamMessage } from './api/fetchers'
import type { Message } from './api/schemas'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from './stores'
import ChatStream from './components/chat-stream'

const ROW_COUNT = 8
const TOKEN_COUNT = 120
const TOKEN_GAP_MS = 4
const SCROLL_PAIRS = 4
const SCROLL_HEIGHT = 2000
const CLIENT_HEIGHT = 500
const SCROLL_TOP_FAR = 0
const SCROLL_TOP_BOTTOM = 1600

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
        text: 'x'.repeat(TOKEN_COUNT),
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

const seededMessages = (count: number): Message[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `m${i}`,
    conversationId: 'c1',
    role: 'ASSISTANT',
    text: `${h.rowPrefix}${i}`,
    attachments: [],
    operationId: null,
    createdAt: '2026-09-01T00:00:00Z',
  }))

const Harness = () => {
  const messages = useMessagesStore((s) => s.messages)
  const sendStatus = useMessagesStore((s) => s.sendStatus)
  return (
    <ChatStream
      messages={messages}
      status="success"
      sendStatus={sendStatus}
    />
  )
}

describe('render count', () => {
  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
    resetRenderCounts()
  })

  it('keeps committed rows unrendered while stream tokens flush', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (let i = 0; i < TOKEN_COUNT; i++) {
        yield { type: 'token', text: 'x' }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation() }
    } as never)

    useMessagesStore.setState({ messages: seededMessages(ROW_COUNT) })
    let commits = 0
    const startedAt = performance.now()
    render(
      <Profiler id="chat" onRender={() => { commits += 1 }}>
        <Harness />
      </Profiler>,
    )
    await act(async () => {
      await useMessagesStore.getState().send('c1', 'hello')
    })
    const elapsedMs = performance.now() - startedAt
    console.log(
      JSON.stringify({
        scenario: 'stream',
        tokens: TOKEN_COUNT,
        elapsedMs: Math.round(elapsedMs),
        commits,
        rowRenders: getRenderCount('row'),
        streamRenders: getRenderCount('stream'),
      }),
    )
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    expect(getRenderCount('row')).toBe(ROW_COUNT)
  })

  it('keeps rows unrendered across scroll commits', () => {
    useMessagesStore.setState({ messages: seededMessages(ROW_COUNT) })
    let commits = 0
    const { container } = render(
      <Profiler id="chat" onRender={() => { commits += 1 }}>
        <Harness />
      </Profiler>,
    )
    const list = container.querySelector<HTMLDivElement>('.chat-vlist')
    if (!list) throw new Error('chat-vlist missing')
    Object.defineProperty(list, 'scrollHeight', {
      value: SCROLL_HEIGHT,
      configurable: true,
    })
    Object.defineProperty(list, 'clientHeight', {
      value: CLIENT_HEIGHT,
      configurable: true,
    })
    Object.defineProperty(list, 'scrollTop', {
      value: SCROLL_TOP_FAR,
      writable: true,
      configurable: true,
    })
    const scrollTo = (top: number) => {
      list.scrollTop = top
      act(() => {
        fireEvent.scroll(list)
      })
    }
    for (let i = 0; i < SCROLL_PAIRS; i++) {
      scrollTo(SCROLL_TOP_FAR)
      scrollTo(SCROLL_TOP_BOTTOM)
    }
    console.log(
      JSON.stringify({
        scenario: 'scroll',
        commits,
        rowRenders: getRenderCount('row'),
      }),
    )
    expect(getRenderCount('row')).toBe(ROW_COUNT)
  })
})
