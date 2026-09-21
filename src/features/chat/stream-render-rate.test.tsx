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

const TOKEN_COUNT = 120
const TOKEN_GAP_MS = 4
const STREAM_FLUSH_MS = 16

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

describe('stream render rate', () => {
  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
  })

  it('caps tree commits while tokens arrive one per macrotask', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(async function* () {
      for (let i = 0; i < TOKEN_COUNT; i++) {
        yield { type: 'token', text: 'x' }
        await new Promise((r) => setTimeout(r, TOKEN_GAP_MS))
      }
      yield { type: 'done', operation: operation() }
    } as never)

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
    const commitsPerSec = (commits / elapsedMs) * 1000
    console.log(
      JSON.stringify({
        tokens: TOKEN_COUNT,
        elapsedMs: Math.round(elapsedMs),
        commits,
        commitsPerSec: Math.round(commitsPerSec),
      }),
    )
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    expect(commits).toBeLessThanOrEqual(
      Math.ceil(elapsedMs / STREAM_FLUSH_MS) + 4,
    )
  })
})
