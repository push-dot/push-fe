import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Operation } from '@/shared/api'

const h = vi.hoisted(() => ({
  calls: [] as string[],
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
    if (typeof children === 'string') h.calls.push(children)
    return <div className="chat-md">{children}</div>
  }
  return { default: Markdown }
})

import { streamMessage } from './api/fetchers'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from './stores'
import ChatStream from './components/chat-stream'

const TOKEN_GAP_MS = 4
const BLOCK_COUNT = 6
const WORDS_PER_BLOCK = 10

const operation = (text: string): Operation => ({
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
        text,
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

const blockText = (i: number) => `block ${i} ` + 'word '.repeat(WORDS_PER_BLOCK)

describe('incremental markdown', () => {
  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
    h.calls.length = 0
  })

  it('re-parses only the in-progress tail while streaming', async () => {
    enableAi()
    let full = ''
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (let b = 0; b < BLOCK_COUNT; b++) {
        const chunk = blockText(b)
        full += chunk
        for (const ch of chunk) {
          yield { type: 'token', text: ch }
          await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
        }
        full += '\n\n'
        yield { type: 'token', text: '\n\n' }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation(full) }
    } as never)

    render(<Harness />)
    await act(async () => {
      await useMessagesStore.getState().send('c1', 'hello')
    })

    const stableCalls = h.calls.filter((c) => c.endsWith('\n\n'))
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    expect(stableCalls.length).toBeLessThanOrEqual(BLOCK_COUNT + 1)
    expect(new Set(stableCalls).size).toBe(stableCalls.length)
  })

  it('renders fenced code and tables identically after stream completes', async () => {
    enableAi()
    const text =
      'intro\n\n```ts\nconst a = 1\n\nconst b = 2\n```\n\n| a | b |\n| - | - |\n| 1 | 2 |'
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (const ch of text) {
        yield { type: 'token', text: ch }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation(text) }
    } as never)

    const { container } = render(<Harness />)
    await act(async () => {
      await useMessagesStore.getState().send('c1', 'hello')
    })

    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    const lastCall = h.calls[h.calls.length - 1]
    expect(lastCall).toBe(text)
    expect(container.textContent).toContain('const b = 2')
    expect(container.textContent).toContain('| 1 | 2 |')
  })
})
