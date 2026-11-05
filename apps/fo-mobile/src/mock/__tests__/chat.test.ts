import { describe, expect, it } from 'vitest'
import type { ChatEvent, Step } from '@/features/chat'
import { mockFetch } from '../server'
import '../chat'

const call = async (method: string, path: string, body?: unknown) => {
  const res = await mockFetch(new Request(`http://x/api/v1/${path}`, { method, body: body === undefined ? undefined : JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }))
  return (await res.json()) as { data: unknown }
}
const run = async (conversationId: string, extra: object) => ((await call('POST', 'chat/runs', { conversationId, ...extra })).data as Step[]).map((s) => s.event)
const types = (events: ChatEvent[]) => events.map((e) => e.type)

describe('chat mock', () => {
  it('seeds the five live conversations and three archived ones the design draws', async () => {
    const live = (await call('GET', 'conversations')).data as { id: string }[]
    const kept = (await call('GET', 'conversations?archived=true')).data as { id: string }[]
    expect(live.map((c) => c.id)).toEqual(['c-moa', 'c-dotori', 'c-career', 'c-pado', 'c-nuri'])
    expect(kept).toHaveLength(3)
  })

  it('runs a tour token instead of the generic reply', async () => {
    const events = await run('t-free', { text: 'ph1-free' })
    const fit = events.find((e) => e.type === 'fit')
    expect(fit).toMatchObject({ plan: 'FREE' })
  })

  it('fails the first 병목 강도 pick and passes the second', async () => {
    await run('t-verify', { text: 'ph2x' })
    const first = await run('t-verify', { answer: { approvalId: 'ph2x-level', choice: 1 } })
    const second = await run('t-verify', { answer: { approvalId: 'ph2x-level', choice: 1 } })
    expect(first.some((e) => e.type === 'approval' && e.approval.id === 'ph2x-verify')).toBe(true)
    expect(types(second)).toContain('plan')
  })

  it('maps quick-start intents to their scenario', async () => {
    const boost = await run('t-boost', { text: '점수를 올려 주세요', intent: 'boost' })
    expect(boost.some((e) => e.type === 'approval' && e.approval.id === 'ph3-boost')).toBe(true)
  })
})
