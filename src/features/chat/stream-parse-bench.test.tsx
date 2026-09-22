import { Profiler } from 'react'
import { act, render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Operation } from '@/shared/api'

vi.mock('./api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
    streamActive: vi.fn(),
  }
})

import { streamMessage } from './api/fetchers'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from './stores'
import ChatStream from './components/chat-stream'

const TOKEN_COUNT = 500
const WORDS_PER_TOKEN = 10
const TOKEN_GAP_MS = 1

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

describe('stream parse bench', () => {
  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
  })

  it('measures real markdown parse cost over a stream', async () => {
    enableAi()
    let full = ''
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (let i = 0; i < TOKEN_COUNT; i++) {
        const chunk = i % 30 === 29 ? '\n\n' : 'w '.repeat(WORDS_PER_TOKEN)
        full += chunk
        yield { type: 'token', text: chunk }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation(full) }
    } as never)

    let renderMs = 0
    let commits = 0
    const startedAt = performance.now()
    render(
      <Profiler
        id="chat"
        onRender={(_id, _phase, actualDuration) => {
          renderMs += actualDuration
          commits += 1
        }}
      >
        <Harness />
      </Profiler>,
    )
    await act(async () => {
      await useMessagesStore.getState().send('c1', 'hello')
    })
    const elapsedMs = performance.now() - startedAt
    console.log(
      JSON.stringify({
        scenario: 'stream-parse-real',
        tokens: TOKEN_COUNT,
        chars: full.length,
        commits,
        renderMs: Math.round(renderMs * 10) / 10,
        elapsedMs: Math.round(elapsedMs),
      }),
    )
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
  })
})
