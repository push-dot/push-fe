import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Message } from '../api/schemas'
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

import { listMessages, streamActive, streamMessage } from '../api/fetchers'
import { queryClient } from '@/shared/api'
import { useInferenceSettings } from '@/features/inference'
import { useMessagesStore } from '../stores'

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

const operation = (userId: string, assistantId: string): Operation => ({
  id: 'op1',
  type: 'CHAT_MESSAGE',
  applicationId: null,
  status: 'SUCCEEDED',
  progress: null,
  result: {
    kind: 'CHAT_MESSAGE',
    value: {
      userMessage: message({ id: userId, role: 'USER', text: 'hello' }),
      assistantMessage: message({ id: assistantId, text: 'world' }),
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

const emptyPage = { nextCursor: null, hasMore: false }

describe('stream lifecycle guards', () => {
  beforeEach(() => {
    vi.mocked(listMessages).mockReset()
    vi.mocked(streamMessage).mockReset()
    vi.mocked(streamActive).mockReset()
    vi.mocked(streamActive).mockImplementation(async function* () {} as never)
    queryClient.clear()
    useMessagesStore.getState().reset()
    useInferenceSettings.setState({ models: [], modelsStatus: 'idle' })
  })

  it('ignores terminal events from an aborted stream superseded by a new send', async () => {
    enableAi()
    let release: () => void = () => {}
    const gate = new Promise<void>((r) => {
      release = r
    })
    vi.mocked(streamMessage)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'old', seq: 1 }
        await gate
        yield { type: 'done', seq: 3, operation: operation('u-old', 'a-old') }
      } as never)
      .mockImplementationOnce(async function* () {
        yield { type: 'token', text: 'new', seq: 1 }
        yield { type: 'done', seq: 2, operation: operation('u-new', 'a-new') }
      } as never)

    const first = useMessagesStore.getState().send('c1', 'first')
    await vi.waitFor(() =>
      expect(useMessagesStore.getState().sendStatus).toBe('streaming'),
    )
    await useMessagesStore.getState().send('c1', 'second')

    release()
    await first
    await vi.waitFor(() => expect(streamMessage).toHaveBeenCalledTimes(2))

    const s = useMessagesStore.getState()
    expect(s.sendStatus).toBe('idle')
    expect(s.failed).toBeNull()
    expect(s.messages.map((m) => m.id)).toEqual(['u-new', 'a-new'])
  })

  it('does not let a stale load overwrite a newer conversation', async () => {
    let release: (v: unknown) => void = () => {}
    const gate = new Promise((r) => {
      release = r
    })
    vi.mocked(listMessages).mockImplementation(((id: string) => {
      if (id === 'c1') return gate
      return Promise.resolve({
        data: [message({ id: 'm2', conversationId: 'c2' })],
        page: emptyPage,
      })
    }) as never)

    const stale = useMessagesStore.getState().load('c1')
    await useMessagesStore.getState().load('c2')
    release({
      data: [message({ id: 'm1', conversationId: 'c1' })],
      page: emptyPage,
    })
    await stale

    const s = useMessagesStore.getState()
    expect(s.conversationId).toBe('c2')
    expect(s.status).toBe('success')
    expect(s.messages.map((m) => m.id)).toEqual(['m2'])
  })

  it('does not flag error status when a stale load fails after switching', async () => {
    let reject: (e: unknown) => void = () => {}
    const gate = new Promise((_, r) => {
      reject = r
    })
    vi.mocked(listMessages).mockImplementation(((id: string) => {
      if (id === 'c1') return gate
      return Promise.resolve({
        data: [message({ id: 'm2', conversationId: 'c2' })],
        page: emptyPage,
      })
    }) as never)

    const stale = useMessagesStore.getState().load('c1')
    await useMessagesStore.getState().load('c2')
    reject(new Error('down'))
    await stale

    const s = useMessagesStore.getState()
    expect(s.conversationId).toBe('c2')
    expect(s.status).toBe('success')
    expect(s.messages.map((m) => m.id)).toEqual(['m2'])
  })
})
