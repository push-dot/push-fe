import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ChatState } from '../types'

const post = vi.hoisted(() => vi.fn())
vi.mock('@/shared/infrastructure', () => ({
  api: { conversations: { stream: vi.fn(), follow: vi.fn(), resolveApproval: vi.fn() }, me: { updateSettings: vi.fn() } },
  http: { post },
  API_MOCK: true,
  hapticImpactLight: vi.fn(),
  hapticNotify: vi.fn(),
}))
vi.mock('@/features/my', () => ({ myApi: { upload: vi.fn(), sources: vi.fn(), googleConnected: vi.fn() } }))

const { send, stop, useChatStore } = await import('../stores')

const chat = (id: string) => useChatStore.getState().chats[id]!
const words = Array.from({ length: 200 }, (_, i) => `w${i} `)
const tokens = (wait = 0) => words.map((text) => ({ wait, event: { type: 'token', text } }))
const approval = { id: 'ap-1', title: '확인', sections: [{ kind: 'choices', items: ['네', '직접 말하기'] }] }

const snapshots = (id: string) => {
  const seen: ChatState[] = []
  const off = useChatStore.subscribe((s) => {
    const c = s.chats[id]
    if (c && c !== seen[seen.length - 1]) seen.push(c)
  })
  return { seen, off }
}

beforeEach(() => {
  vi.clearAllMocks()
  useChatStore.setState({ chats: {} })
})

describe('token batching', () => {
  it('renders every token, in order, in far fewer commits than tokens', async () => {
    post.mockResolvedValue({ data: [...tokens(), { wait: 0, event: { type: 'done', at: 0 } }] })
    const { seen, off } = snapshots('c1')
    send('c1', '다듬어 주세요')
    await vi.waitFor(() => expect(chat('c1').working).toBeNull())
    off()
    const texts = chat('c1').items.filter((i) => i.type === 'agentText')
    expect(texts).toHaveLength(1)
    expect(texts[0]!.type === 'agentText' && texts[0]!.text).toBe(words.join(''))
    const growth = seen.map((c) => c.items.find((i) => i.type === 'agentText')).flatMap((i) => (i?.type === 'agentText' ? [i.text] : []))
    growth.forEach((t, k) => k && expect(t.startsWith(growth[k - 1]!)).toBe(true))
    expect(seen.length).toBeLessThan(words.length / 4)
  })

  it('flushes buffered text before the approval and the done that follow it', async () => {
    post.mockResolvedValue({
      data: [...tokens(), { wait: 0, event: { type: 'approval', approval } }, { wait: 0, event: { type: 'token', text: '끝' } }, { wait: 0, event: { type: 'done', at: 0 } }],
    })
    const { seen, off } = snapshots('c2')
    send('c2', '다듬어 주세요')
    await vi.waitFor(() => expect(chat('c2').items.at(-1)?.type).toBe('worked'))
    off()
    const atApproval = seen.find((c) => c.approval)!
    const text = atApproval.items.findLast((i) => i.type === 'agentText')
    expect(text?.type === 'agentText' && text.text).toBe(words.join(''))
    const last = chat('c2').items.at(-2)
    expect(last?.type === 'agentText' && last.text).toBe(`${words.join('')}끝`)
  })

  it('flushes buffered text before an error', async () => {
    post.mockResolvedValueOnce({ data: [{ wait: 0, event: { type: 'token', text: '반쯤 ' } }, { wait: 0, event: { type: 'error', id: 'e1', text: '실패' } }] })
    send('c3', '다듬어 주세요')
    await vi.waitFor(() => expect(chat('c3').working).toBeNull())
    expect(chat('c3').items.map((i) => i.type)).toEqual(['user', 'agentText', 'error'])
  })

  it('shows the first token at once, keeps the text received before a stop ahead of it, and nothing after it', async () => {
    vi.useFakeTimers()
    try {
      post.mockResolvedValue({ data: [...tokens(10), { wait: 0, event: { type: 'done', at: 0 } }] })
      send('c4', '다듬어 주세요')
      await vi.advanceTimersByTimeAsync(15)
      const first = chat('c4').items.findLast((i) => i.type === 'agentText')
      expect(first?.type === 'agentText' && first.text).toBe(words[0])
      await vi.advanceTimersByTimeAsync(90)
      const shown = chat('c4').items.findLast((i) => i.type === 'agentText')
      expect(shown?.type === 'agentText' && shown.text).toBe(words.slice(0, 5).join(''))
      stop('c4')
      const stopped = chat('c4')
      const kept = stopped.items.findLast((i) => i.type === 'agentText')
      expect(kept?.type === 'agentText' && kept.text).toBe(words.slice(0, 10).join(''))
      expect(stopped.interrupted).toBe(true)
      await vi.advanceTimersByTimeAsync(500)
      expect(chat('c4')).toBe(stopped)
    } finally {
      vi.useRealTimers()
    }
  })
})
