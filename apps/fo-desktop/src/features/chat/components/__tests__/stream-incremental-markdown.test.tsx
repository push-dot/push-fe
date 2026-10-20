import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Operation } from '@/shared/api'

const h = vi.hoisted(() => ({
  calls: [] as string[],
}))

vi.mock('../../api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
    streamActive: vi.fn(),
  }
})

vi.mock('react-markdown', async () => {
  const { useEffect } = await import('react')
  const Markdown = ({ children }: { children?: ReactNode }) => {
    // Record on commit, not render: concurrent rendering may invoke the
    // component twice for one commit, which would count duplicates that
    // never reached the DOM.
    useEffect(() => {
      if (typeof children === 'string') h.calls.push(children)
    }, [children])
    return <div className="chat-md">{children}</div>
  }
  return { default: Markdown }
})

import { streamMessage } from '../../api/fetchers'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from '../../stores'
import ChatStream from '../chat-stream'

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

    const assistant = useMessagesStore.getState().messages.at(-1)?.text ?? ''
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    expect(assistant.endsWith('\n\n')).toBe(true)

    // Completed blocks are split off the live tail, so a tail parse never
    // contains a finished blank-line boundary. Re-parsing the whole buffer
    // on each token would put those boundaries in the tail calls.
    const tailCalls = h.calls.filter((call) => !call.endsWith('\n\n'))
    expect(tailCalls.length).toBeGreaterThan(0)
    for (const tail of tailCalls) {
      expect(tail.includes('\n\n')).toBe(false)
    }

    // Stable snapshots are the nested prefixes committed at block boundaries.
    // A boundary can be coalesced into a later flush, but each one that
    // commits must extend the previous prefix of the final document.
    const stableCalls = h.calls.filter((call) => call.endsWith('\n\n'))
    const counts = new Map<string, number>()
    const firstSeen: string[] = []
    for (const call of stableCalls) {
      counts.set(call, (counts.get(call) ?? 0) + 1)
      if (firstSeen[firstSeen.length - 1] !== call) firstSeen.push(call)
    }
    expect(firstSeen.length).toBeGreaterThan(1)
    expect(firstSeen.length).toBeLessThanOrEqual(BLOCK_COUNT)
    for (const prefix of firstSeen) {
      expect(assistant.startsWith(prefix)).toBe(true)
    }
    for (let i = 1; i < firstSeen.length; i++) {
      expect(firstSeen[i].startsWith(firstSeen[i - 1])).toBe(true)
      expect(firstSeen[i].length).toBeGreaterThan(firstSeen[i - 1].length)
    }

    // The committed assistant message parses the full document once. When the
    // 16ms flush timer paints that same snapshot in its own turn before
    // `done`, the live bubble parses it once too. Which of those two commits
    // lands is timer order, so the final document may be seen twice. An
    // earlier prefix repeating would mean a finished block was re-parsed.
    for (const [text, n] of counts) {
      expect(n).toBeLessThanOrEqual(text === assistant ? 2 : 1)
    }
    expect(counts.get(assistant)).toBeGreaterThanOrEqual(1)
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
