import { ApiError, type StreamEvent } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'
import { chatGateFrom } from './chat-gate'
import { answerApproval, applyTurnEvent, EMPTY_TURN, runTurn, type TurnDeps } from './chat-turn'

const frames = async function* (...events: StreamEvent[]) {
  yield* events
}

const failing = async function* (error: unknown): AsyncGenerator<StreamEvent> {
  yield* []
  throw error
}

const depsOf = (overrides: Partial<TurnDeps> = {}): TurnDeps => ({
  stream: vi.fn(() => frames()),
  follow: vi.fn(() => frames()),
  resolve: vi.fn(async () => ({})),
  ...overrides,
})

const collect = () => {
  const events: StreamEvent[] = []
  return { events, onEvent: (event: StreamEvent) => void events.push(event) }
}

const draft = {
  id: 'p1',
  title: '백엔드 엔지니어',
  description: '결제 API를 만들어요',
  requirements: ['서버 개발 경력'],
  workConditions: { 근무: '주 5일' },
}

describe('runTurn', () => {
  it('sends the chosen access mode and resumes a cut stream from the last seq', async () => {
    const deps = depsOf({
      stream: vi.fn(() => frames({ type: 'token', text: '안', seq: 3 })),
      follow: vi.fn(() => frames({ type: 'token', text: '녕', seq: 4 }, { type: 'done', operation: null, seq: 5 })),
    })
    const { events, onEvent } = collect()
    await runTurn(deps, 'c1', { text: '공고 써 줘', accessMode: 'BYPASS', intent: 'posting' }, onEvent)
    expect(deps.stream).toHaveBeenCalledWith('c1', { text: '공고 써 줘', accessMode: 'BYPASS', intent: 'posting' })
    expect(deps.follow).toHaveBeenCalledWith('c1', 3)
    expect(events.map((event) => event.seq)).toEqual([3, 4, 5])
  })

  it('does not follow a stream that already ended', async () => {
    const deps = depsOf({ stream: vi.fn(() => frames({ type: 'done', operation: null, seq: 2 })) })
    await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, () => undefined)
    expect(deps.follow).not.toHaveBeenCalled()
  })

  it('rejects with the pre-stream error so the gate shows, with no fallback send', async () => {
    const error = new ApiError('company is not verified', 'BUSINESS_NOT_VERIFIED', 403)
    const deps = depsOf({ stream: vi.fn(() => failing(error)) })
    const caught = await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, () => undefined).catch((e: unknown) => e)
    expect(chatGateFrom(caught)).toBe('verify')
    expect(Object.keys(deps)).toEqual(['stream', 'follow', 'resolve'])
    expect(deps.follow).not.toHaveBeenCalled()
  })

  it('turns an error frame into an ApiError', async () => {
    const deps = depsOf({
      stream: vi.fn(() => frames({ type: 'error', error: { code: 'PLAN_REQUIRED', message: 'pro', details: { requiredPlan: 'PRO' } }, seq: 1 })),
    })
    const caught = await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, () => undefined).catch((e: unknown) => e)
    expect(chatGateFrom(caught)).toBe('interview')
  })
})

describe('answerApproval', () => {
  it('resolves with the option id and keeps reading the resumed job', async () => {
    const deps = depsOf({
      resolve: vi.fn(async () => ({ jobId: 'j2' })),
      follow: vi.fn(() => frames({ type: 'tool', name: 'publish_posting', state: 'ok', summary: '공고를 게시해요', seq: 1 })),
    })
    const { events, onEvent } = collect()
    await answerApproval(deps, 'c1', 'a1', 'approve', onEvent)
    expect(deps.resolve).toHaveBeenCalledWith('c1', 'a1', 'approve')
    expect(deps.follow).toHaveBeenCalledWith('c1')
    expect(events).toHaveLength(1)
  })

  it('stops after resolving when no job was queued', async () => {
    const deps = depsOf()
    await answerApproval(deps, 'c1', 'a1', 'reject', () => undefined)
    expect(deps.follow).not.toHaveBeenCalled()
  })
})

describe('applyTurnEvent', () => {
  it('collects reply text, tool log, approval cards, the saved draft, and the awaiting state', () => {
    const events: StreamEvent[] = [
      { type: 'token', text: '초안을 ' },
      { type: 'tool', name: 'draft_posting', state: 'run', summary: '공고 초안을 저장해요' },
      { type: 'tool', name: 'draft_posting', state: 'ok', summary: '공고 초안을 저장해요', result: { draft } },
      { type: 'token', text: '저장했어요' },
      { type: 'tool', name: 'publish_posting', state: 'wait', summary: '공고를 게시해요', tier: 'RISKY_WRITE' },
      {
        type: 'approval', id: 'a1', kind: 'TOOL_ACTION', title: '공고를 게시해요', summary: '공고를 게시해요',
        options: [{ id: 'approve', label: '실행' }, { id: 'reject', label: '취소' }],
      },
      { type: 'done', operation: null, awaiting: 'approval' },
    ]
    const turn = events.reduce(applyTurnEvent, EMPTY_TURN)
    expect(turn.text).toBe('초안을 저장했어요')
    expect(turn.awaiting).toBe('approval')
    expect(turn.items).toEqual([
      {
        kind: 'tool', key: 'draft_posting-0', name: 'draft_posting', state: 'ok', summary: '공고 초안을 저장해요',
        postingId: 'p1',
        draft: { title: '백엔드 엔지니어', description: '결제 API를 만들어요', requirements: ['서버 개발 경력'], preferred: [], workConditions: { 근무: '주 5일' } },
      },
      { kind: 'tool', key: 'publish_posting-1', name: 'publish_posting', state: 'wait', summary: '공고를 게시해요' },
      { kind: 'approval', id: 'a1', title: '공고를 게시해요', options: [{ id: 'approve', label: '실행' }, { id: 'reject', label: '취소' }] },
    ])
  })

  it('updates a waiting tool in place when the resumed job reports it', () => {
    const turn = [
      { type: 'tool', name: 'close_posting', state: 'wait', summary: '공고를 마감해요' },
      { type: 'tool', name: 'close_posting', state: 'err', summary: '공고를 마감해요', result: { error: 'REVISION_CONFLICT' } },
      { type: 'tool', name: 'close_posting', state: 'run', summary: '공고를 마감해요' },
    ].reduce((t, e) => applyTurnEvent(t, e as StreamEvent), EMPTY_TURN)
    expect(turn.items.map((item) => (item.kind === 'tool' ? item.state : item.kind))).toEqual(['err', 'run'])
  })

  it('ignores a repeated approval frame', () => {
    const approval: StreamEvent = { type: 'approval', id: 'a1', kind: 'TOOL_ACTION', title: 't', options: [{ id: 'approve', label: '실행' }] }
    const turn = [approval, approval].reduce(applyTurnEvent, EMPTY_TURN)
    expect(turn.items).toHaveLength(1)
  })
})
