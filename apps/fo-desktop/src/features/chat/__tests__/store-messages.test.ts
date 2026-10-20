import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from '../api/schemas'
import type { Operation } from '@/shared/api'

vi.mock('../api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
  }
})

import { listMessages, streamMessage } from '../api/fetchers'
import { queryClient } from '@/shared/api'
import { useInferenceSettings } from '@/features/inference'
import { createMessagesStore, useMessagesStore } from '../stores'

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

const operation = (over: Partial<Operation> = {}): Operation => ({
  id: 'op1',
  type: 'CHAT_MESSAGE',
  applicationId: null,
  status: 'SUCCEEDED',
  progress: null,
  result: {
    kind: 'CHAT_MESSAGE',
    value: {
      userMessage: message({ id: 'u1', role: 'USER', text: 'hello' }),
      assistantMessage: message({ id: 'a1', text: 'world' }),
      approvalIds: [],
    },
  },
  error: null,
  inputRequest: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
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

const streamOf = async function* (events: { type: string; [k: string]: unknown }[]) {
  for (const e of events) yield e
}

describe('messages store', () => {
  beforeEach(() => {
    vi.mocked(listMessages).mockReset()
    vi.mocked(streamMessage).mockReset()
    queryClient.clear()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
  })

  it('loads messages for a conversation', async () => {
    vi.mocked(listMessages).mockResolvedValue({
      data: [message()],
      page: { nextCursor: 'cur1', hasMore: true },
    })
    await useMessagesStore.getState().load('c1')
    const s = useMessagesStore.getState()
    expect(s.status).toBe('success')
    expect(s.conversationId).toBe('c1')
    expect(s.messages).toHaveLength(1)
    expect(s.hasMore).toBe(true)
    expect(s.nextCursor).toBe('cur1')
  })

  it('prepends older messages on loadMore', async () => {
    vi.mocked(listMessages)
      .mockResolvedValueOnce({
        data: [message({ id: 'new1' })],
        page: { nextCursor: 'cur1', hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [message({ id: 'old1' })],
        page: { nextCursor: null, hasMore: false },
      })
    const store = useMessagesStore.getState()
    await store.load('c1')
    await useMessagesStore.getState().loadMore()
    const s = useMessagesStore.getState()
    expect(s.messages.map((m) => m.id)).toEqual(['old1', 'new1'])
    expect(s.hasMore).toBe(false)
    expect(s.loadingMore).toBe(false)
  })

  it('deduplicates overlapping messages on loadMore', async () => {
    vi.mocked(listMessages)
      .mockResolvedValueOnce({
        data: [message({ id: 'new1' }), message({ id: 'new2' })],
        page: { nextCursor: 'cur1', hasMore: true },
      })
      .mockResolvedValueOnce({
        data: [
          message({ id: 'old1', createdAt: '2026-08-01T00:00:00Z' }),
          message({ id: 'new1' }),
        ],
        page: { nextCursor: null, hasMore: false },
      })
    await useMessagesStore.getState().load('c1')
    await useMessagesStore.getState().loadMore()
    const s = useMessagesStore.getState()
    expect(s.messages.map((m) => m.id).sort()).toEqual(['new1', 'new2', 'old1'])
    expect(s.messages.filter((m) => m.id === 'new1')).toHaveLength(1)
  })

  it('abandons a send when the conversation resets during ensureModels', async () => {
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' } as never)
    let release: (() => void) | null = null
    const gate = new Promise<void>((r) => {
      release = r
    })
    const store = createMessagesStore({
      aiOptions: () => null,
      ensureModels: () => gate,
      accessMode: () => 'SUGGEST',
      byokKey: () => '',
      ensureApproval: () => {},
      streamRenderVariant: async () => 'A',
    })
    const send = store.getState().send('c1', 'hello')
    store.getState().reset()
    release!()
    await send
    expect(streamMessage).not.toHaveBeenCalled()
    expect(store.getState().messages).toHaveLength(0)
  })

  it('resets the stream sequence filter on each send', async () => {
    enableAi()
    let release: (() => void) | null = null
    const gate = new Promise<void>((r) => {
      release = r
    })
    vi.mocked(streamMessage)
      .mockImplementationOnce(
        () =>
          streamOf([
            { type: 'token', text: 'first', seq: 7 },
            { type: 'done', seq: 8, operation: operation() },
          ]) as never,
      )
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'low', seq: 1 }
        await gate
        yield { type: 'done', seq: 2, operation: operation() }
      } as never)
    await useMessagesStore.getState().send('c1', 'one')
    const second = useMessagesStore.getState().send('c1', 'two')
    await vi.waitFor(() =>
      expect(useMessagesStore.getState().sendStatus).toBe('streaming'),
    )
    release!()
    await second
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
  })

  it('skips loadMore without cursor', async () => {
    vi.mocked(listMessages).mockResolvedValue({
      data: [message()],
      page: { nextCursor: null, hasMore: false },
    })
    await useMessagesStore.getState().load('c1')
    await useMessagesStore.getState().loadMore()
    expect(listMessages).toHaveBeenCalledTimes(1)
  })

  it('surfaces load failures as error status', async () => {
    vi.mocked(listMessages).mockRejectedValue(new Error('down'))
    await useMessagesStore.getState().load('c1')
    expect(useMessagesStore.getState().status).toBe('error')
  })

  it('streams tokens then replaces optimistic message on done', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(
      () =>
        streamOf([
          { type: 'token', text: 'wor' },
          { type: 'token', text: 'ld' },
          { type: 'done', operation: operation() },
        ]) as never,
    )
    const send = useMessagesStore.getState().send('c1', 'hello')
    await send
    const s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.streamText).toBe('')
    expect(s.messages.map((m) => m.id)).toEqual(['u1', 'a1'])
  })

  it('accumulates tokens into streamText while streaming', async () => {
    enableAi()
    let release: (() => void) | null = null
    const gate = new Promise<void>((r) => {
      release = r
    })
    vi.mocked(streamMessage).mockImplementation(async function* () {
      yield { type: 'token', text: 'par' }
      yield { type: 'token', text: 'tial' }
      await gate
      yield { type: 'done', operation: operation() }
    } as never)
    const send = useMessagesStore.getState().send('c1', 'hello')
    await vi.waitFor(() => expect(useMessagesStore.getState().streamText).toBe('partial'))
    expect(useMessagesStore.getState().sendStatus).toBe('streaming')
    release!()
    await send
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
  })

  it('keeps failed message and retry resends it', async () => {
    enableAi()
    vi.mocked(streamMessage)
      .mockImplementationOnce(async function* () {
        yield { type: 'error', error: { code: 'PROVIDER_ERROR', message: 'boom' } }
      } as never)
      .mockImplementationOnce(() => streamOf([{ type: 'done', operation: operation() }]) as never)
    vi.mocked(listMessages).mockResolvedValue({
      data: [],
      page: { nextCursor: null, hasMore: false },
    })
    await useMessagesStore.getState().load('c1')
    await useMessagesStore.getState().send('c1', 'hello')
    let s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('failed')
    expect(s.failed?.text).toBe('hello')
    expect(s.messages).toHaveLength(1)
    await useMessagesStore.getState().retry()
    s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.messages.map((m) => m.id)).toEqual(['u1', 'a1'])
  })

  it('abort clears sending state and optimistic message', async () => {
    enableAi()
    vi.mocked(streamMessage).mockImplementation(((
      _id: string,
      _b: unknown,
      opts: { signal?: AbortSignal },
    ) =>
      (async function* () {
        yield { type: 'token', text: 'x' }
        await new Promise((_, reject) => {
          opts.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          )
        })
      })()) as never)
    const send = useMessagesStore.getState().send('c1', 'hello')
    await vi.waitFor(() => expect(useMessagesStore.getState().sendStatus).toBe('streaming'))
    useMessagesStore.getState().abort()
    await send
    const s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.messages).toHaveLength(0)
  })

  it('never calls the API when no AI model is configured', async () => {
    await useMessagesStore.getState().send('c1', 'hello')
    expect(streamMessage).not.toHaveBeenCalled()
    expect(useMessagesStore.getState().sendStatus).toBe('idle')
    expect(useMessagesStore.getState().messages).toHaveLength(0)
  })
})
