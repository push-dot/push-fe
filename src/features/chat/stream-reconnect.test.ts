import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from './api/schemas'
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

import { listMessages, streamActive, streamMessage } from './api/fetchers'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from './stores'

const message = (over: Partial<Message> = {}): Message => ({
  id: 'm1',
  conversationId: 'c1',
  role: 'ASSISTANT',
  text: 'hi',
  attachments: [],
  operationId: null,
  createdAt: '2026-09-01T00:00:00Z',
  ...over,
})

const operation = (text: string): Operation => ({
  id: 'op1',
  type: 'CHAT_MESSAGE',
  applicationId: null,
  status: 'SUCCEEDED',
  progress: null,
  result: {
    kind: 'CHAT_MESSAGE',
    value: {
      userMessage: message({ id: 'u1', role: 'USER', text: 'hello' }),
      assistantMessage: message({ id: 'a1', text }),
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

const watchStreamText = () => {
  const seen: string[] = []
  const unsub = useMessagesStore.subscribe((s) => {
    if (s.streamText) seen.push(s.streamText)
  })
  return { seen, unsub }
}

describe('stream reconnect', () => {
  beforeEach(() => {
    vi.mocked(listMessages).mockReset()
    vi.mocked(streamMessage).mockReset()
    vi.mocked(streamActive).mockReset()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
  })

  it('resumes an active stream from the last seq without loss or duplication', async () => {
    vi.mocked(streamActive)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'he', seq: 1 }
        yield { type: 'token', text: 'llo', seq: 2 }
        throw new Error('network drop')
      } as never)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'llo', seq: 2 }
        yield { type: 'token', text: ' world', seq: 3 }
        yield { type: 'done', seq: 4, operation: operation('hello world') }
      } as never)

    useMessagesStore.setState({ conversationId: 'c1', sendStatus: 'idle' })
    const { seen, unsub } = watchStreamText()
    await useMessagesStore.getState().attachStream('c1')
    unsub()

    expect(streamActive).toHaveBeenCalledTimes(2)
    expect(vi.mocked(streamActive).mock.calls[1][1]).toMatchObject({ after: 2 })
    expect(seen.at(-1)).toBe('hello world')
    const s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.streamText).toBe('')
    expect(s.messages.map((m) => m.id)).toEqual(['u1', 'a1'])
  })

  it('keeps token order across a reconnect boundary', async () => {
    const chunks = ['a', 'b', 'c', 'd', 'e']
    vi.mocked(streamActive)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'a', seq: 1 }
        yield { type: 'token', text: 'b', seq: 2 }
        throw new Error('drop')
      } as never)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'c', seq: 3 }
        yield { type: 'token', text: 'd', seq: 4 }
        yield { type: 'token', text: 'e', seq: 5 }
        yield { type: 'done', seq: 6, operation: operation('abcde') }
      } as never)

    useMessagesStore.setState({ conversationId: 'c1', sendStatus: 'idle' })
    const { seen, unsub } = watchStreamText()
    await useMessagesStore.getState().attachStream('c1')
    unsub()

    expect(seen.at(-1)).toBe(chunks.join(''))
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i].startsWith(seen[i - 1])).toBe(true)
    }
  })

  it('resumes a dropped send stream through the active endpoint', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(async function* () {
      yield { type: 'token', text: 'he', seq: 10 }
      yield { type: 'token', text: 'llo', seq: 11 }
      throw new Error('network drop')
    } as never)
    vi.mocked(streamActive).mockImplementation(async function* () {
      yield { type: 'token', text: ' world', seq: 12 }
      yield { type: 'done', seq: 13, operation: operation('hello world') }
    } as never)

    const { seen, unsub } = watchStreamText()
    await useMessagesStore.getState().send('c1', 'hello')
    unsub()

    expect(vi.mocked(streamActive).mock.calls[0][1]).toMatchObject({ after: 11 })
    expect(seen.at(-1)).toBe('hello world')
    const s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.failed).toBeNull()
    expect(s.messages.map((m) => m.id)).toEqual(['u1', 'a1'])
  })

  it('reconciles via refetch when the stream ends cleanly without done', async () => {
    vi.mocked(streamActive).mockImplementation(async function* () {
      yield { type: 'token', text: 'partial', seq: 1 }
    } as never)
    vi.mocked(listMessages).mockResolvedValue({
      data: [message({ id: 'a1', text: 'full' })],
      page: { nextCursor: null, hasMore: false },
    })

    useMessagesStore.setState({ conversationId: 'c1', sendStatus: 'idle' })
    await useMessagesStore.getState().attachStream('c1')

    expect(listMessages).toHaveBeenCalled()
    const s = useMessagesStore.getState()
    expect(s.streamText).toBe('')
    expect(s.sendStatus).toBe('idle')
    expect(s.messages.map((m) => m.id)).toEqual(['a1'])
  })
})
