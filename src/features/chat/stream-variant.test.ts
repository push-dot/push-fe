import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from './api/schemas'
import type { AiOptions } from '@/features/inference'
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

vi.mock('@/shared/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...mod,
    trackExperimentEvent: vi.fn().mockResolvedValue(undefined),
  }
})

import { streamMessage } from './api/fetchers'
import { queryClient, trackExperimentEvent } from '@/shared/api'
import { resetExperiments } from '@/shared/lib/experiment'
import { createMessagesStore } from './stores'
import type { MessagesDeps } from './stores'

const ai: AiOptions = {
  provider: 'OPENAI',
  model: 'm',
  credentialMode: 'MANAGED',
  effort: 'LOW',
}

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
      yield { type: 'done', seq: 3, operation: operation('hello world') }
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
      yield { type: 'done', seq: 2, operation: operation('hello') }
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
      yield { type: 'done', seq: 2, operation: operation('hi') }
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
