import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from '../api/schemas'
import type { AiOptions } from '@/features/inference'
import type { Operation } from '@/shared/api'

vi.mock('../api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/fetchers')>()
  return {
    ...mod,
    listMessages: vi.fn(),
    streamMessage: vi.fn(),
    streamActive: vi.fn(),
  }
})

vi.mock('@/shared/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...mod,
    trackExperimentEvent: vi.fn().mockResolvedValue(undefined),
  }
})

import { listMessages, streamActive, streamMessage } from '../api/fetchers'
import { queryClient, trackExperimentEvent } from '@/shared/api'
import { resetExperiments } from '@/shared/lib/experiment'
import { useInferenceSettings } from '@/features/inference'
import { createMessagesStore, useMessagesStore } from '../stores'
import type { MessagesDeps } from '../stores'

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

const textOperation = (text: string): Operation => ({
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

const streamOf = async function* (events: { type: string; [k: string]: unknown }[]) {
  for (const e of events) yield e
}

const watchStreamText = () => {
  const seen: string[] = []
  const unsub = useMessagesStore.subscribe((s) => {
    if (s.streamText) seen.push(s.streamText)
  })
  return { seen, unsub }
}

const ai: AiOptions = {
  provider: 'OPENAI',
  model: 'm',
  credentialMode: 'MANAGED',
  effort: 'LOW',
}

const deps = (variant: string): MessagesDeps => ({
  aiOptions: () => ai,
  ensureModels: () => Promise.resolve(),
  accessMode: () => 'SUGGEST',
  byokKey: () => '',
  ensureApproval: () => {},
  streamRenderVariant: () => Promise.resolve(variant),
})

const events = () =>
  vi.mocked(trackExperimentEvent).mock.calls.map((c) => [c[0], c[1]])

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
        yield { type: 'done', seq: 4, operation: textOperation('hello world') }
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
        yield { type: 'done', seq: 6, operation: textOperation('abcde') }
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
      yield { type: 'done', seq: 13, operation: textOperation('hello world') }
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

describe('stream-render variant', () => {
  beforeEach(() => {
    vi.mocked(streamMessage).mockReset()
    vi.mocked(trackExperimentEvent).mockClear()
    resetExperiments()
    queryClient.clear()
  })

  it('variant B keeps streamText empty and renders once on done', async () => {
    vi.mocked(streamMessage).mockImplementation(async function* () {
      yield { type: 'token', text: 'hello', seq: 1 }
      yield { type: 'token', text: ' world', seq: 2 }
      yield { type: 'done', seq: 3, operation: textOperation('hello world') }
    } as never)
    const store = createMessagesStore(deps('B'))
    const seen: string[] = []
    const unsub = store.subscribe((s) => {
      if (s.streamText) seen.push(s.streamText)
    })
    await store.getState().send('c1', 'hello')
    unsub()

    expect(seen).toEqual([])
    const s = store.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.messages.at(-1)?.text).toBe('hello world')
    expect(events()).toContainEqual(['stream-render', 'exposure'])
  })

  it('variant A commits batched tokens and exposes on first render', async () => {
    vi.mocked(streamMessage).mockImplementation(async function* () {
      yield { type: 'token', text: 'hello', seq: 1 }
      yield { type: 'done', seq: 2, operation: textOperation('hello') }
    } as never)
    const store = createMessagesStore(deps('A'))
    await store.getState().send('c1', 'hello')

    expect(store.getState().messages.at(-1)?.text).toBe('hello')
    expect(events()).toContainEqual(['stream-render', 'exposure'])
  })

  it('tracks conversion when a follow-up send lands within 30s of done', async () => {
    const store = createMessagesStore(deps('A'))
    vi.mocked(streamMessage).mockImplementation(async function* () {
      yield { type: 'token', text: 'hi', seq: 1 }
      yield { type: 'done', seq: 2, operation: textOperation('hi') }
    } as never)
    await store.getState().send('c1', 'hello')
    await store.getState().send('c1', 'again')

    expect(events()).toContainEqual(['stream-render', 'conversion'])
  })

  it('tracks aborted when aborting an in-flight stream', async () => {
    const store = createMessagesStore(deps('A'))
    store.setState({ sendStatus: 'streaming' })
    store.getState().abort()
    expect(events()).toContainEqual(['stream-render', 'aborted'])
  })

  it('does not track aborted when idle', () => {
    const store = createMessagesStore(deps('A'))
    store.getState().abort()
    expect(events()).toEqual([])
  })
})
