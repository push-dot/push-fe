import { ApiError, type StreamEvent } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'
import { chatGateFrom } from './chat-gate'
import {
  answerApproval,
  cancelTurn,
  applyTurnEvent,
  EMPTY_TURN,
  resumeStoredTurn,
  runTurn,
  storedTurn,
  turnText,
  type TurnDeps,
} from './chat-turn'

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
  cancel: vi.fn(async () => ({})),
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
      follow: vi.fn(() =>
        frames({ type: 'token', text: '녕', seq: 4 }, { type: 'done', operation: null, seq: 5 }),
      ),
    })
    const { events, onEvent } = collect()
    await runTurn(
      deps,
      'c1',
      { text: '공고 써 줘', accessMode: 'BYPASS', intent: 'posting' },
      onEvent,
    )
    expect(deps.stream).toHaveBeenCalledWith(
      'c1',
      { text: '공고 써 줘', accessMode: 'BYPASS', intent: 'posting' },
      undefined,
    )
    expect(deps.follow).toHaveBeenCalledWith('c1', 3, undefined)
    expect(events.map((event) => event.seq)).toEqual([3, 4, 5])
  })

  it('keeps following a stream the server closed without a final frame', async () => {
    const deps = depsOf({
      stream: vi.fn(() => frames({ type: 'token', text: '가', seq: 1 })),
      follow: vi
        .fn()
        .mockImplementationOnce(() => frames({ type: 'token', text: '나', seq: 2 }))
        .mockImplementationOnce(() => frames({ type: 'done', operation: null, seq: 3 })),
    })
    const { events, onEvent } = collect()
    await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, onEvent)
    expect(deps.follow).toHaveBeenNthCalledWith(1, 'c1', 1, undefined)
    expect(deps.follow).toHaveBeenNthCalledWith(2, 'c1', 2, undefined)
    expect(events.map((event) => event.seq)).toEqual([1, 2, 3])
  })

  it('stops following when the job is no longer running', async () => {
    const deps = depsOf({ stream: vi.fn(() => frames({ type: 'token', text: '가', seq: 1 })) })
    await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, () => undefined)
    expect(deps.follow).toHaveBeenCalledTimes(1)
  })

  it('does not follow a stream that already ended', async () => {
    const deps = depsOf({ stream: vi.fn(() => frames({ type: 'done', operation: null, seq: 2 })) })
    await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, () => undefined)
    expect(deps.follow).not.toHaveBeenCalled()
  })

  it('rejects with the pre-stream error so the gate shows, with no fallback send', async () => {
    const error = new ApiError('company is not verified', 'BUSINESS_NOT_VERIFIED', 403)
    const deps = depsOf({ stream: vi.fn(() => failing(error)) })
    const caught = await runTurn(
      deps,
      'c1',
      { text: 'x', accessMode: 'AUTO' },
      () => undefined,
    ).catch((e: unknown) => e)
    expect(chatGateFrom(caught)).toBe('verify')
    expect(Object.keys(deps)).toEqual(['stream', 'follow', 'resolve', 'cancel'])
    expect(deps.follow).not.toHaveBeenCalled()
  })

  it('follows a stored running job from the start, so tokens push-be joined into the first seq are not repeated', async () => {
    const stored = {
      jobId: 'j1',
      status: 'RUNNING' as const,
      createdAt: '',
      userMessageId: 'm1',
      assistantMessageId: null,
      answer: null,
      // GET .../turns keeps the first seq of a joined token row: "안" + "녕" → "안녕" at seq 3.
      events: [{ type: 'token' as const, text: '안녕', seq: 3 }],
    }
    const deps = depsOf({
      follow: vi.fn((_id: string, after?: number) => {
        const rows: StreamEvent[] = [
          { type: 'token', text: '안', seq: 3 },
          { type: 'token', text: '녕', seq: 4 },
          { type: 'done', operation: null, seq: 5 },
        ]
        // The gateway follow emits each stored row with id > after, unmerged.
        return frames(...rows.filter((event) => after === undefined || (event.seq ?? 0) > after))
      }),
    })
    let turn = EMPTY_TURN
    await resumeStoredTurn(deps, 'c1', stored, (event) => {
      turn = applyTurnEvent(turn, event)
    })
    expect(deps.follow).toHaveBeenCalledWith('c1', undefined, undefined)
    expect(turnText(turn)).toBe('안녕')
  })

  it('reconnects after a gateway poll INTERNAL frame and clears that failure once the next read succeeds', async () => {
    const deps = depsOf({
      stream: vi.fn(() =>
        frames({ type: 'error', error: { code: 'INTERNAL', message: 'internal error' } }),
      ),
      follow: vi.fn(() =>
        frames(
          { type: 'token', text: '이어서', seq: 2 },
          { type: 'done', operation: null, seq: 3 },
        ),
      ),
    })
    const notices: string[] = []
    const { events, onEvent } = collect()
    await runTurn(deps, 'c1', { text: 'x', accessMode: 'AUTO' }, onEvent, undefined, {
      onPollFailure: () => notices.push('show'),
      onPollRecovered: () => notices.push('clear'),
    })
    expect(events).toEqual([
      { type: 'token', text: '이어서', seq: 2 },
      { type: 'done', operation: null, seq: 3 },
    ])
    expect(notices).toEqual(['show', 'clear'])
    expect(deps.follow).toHaveBeenCalledWith('c1', undefined, undefined)
  })

  it('does not repeat text when a follow delivers frames and then a seq-less INTERNAL', async () => {
    const poll: StreamEvent = { type: 'error', error: { code: 'INTERNAL', message: 'internal error' } }
    const rows: StreamEvent[] = [
      { type: 'token', text: '안녕', seq: 1 },
      { type: 'token', text: '하세요 ', seq: 2 },
      { type: 'token', text: '반가워요', seq: 3 },
      { type: 'token', text: ' 끝', seq: 4 },
      { type: 'done', operation: null, seq: 5 },
    ]
    const pending = (after?: number) => rows.filter((event) => after === undefined || (event.seq ?? 0) > after)
    const follow = vi.fn((_id: string, after?: number) => {
      const rest = pending(after)
      // The first read of each job dies after the frames it already had, the way a gateway poll throws.
      if (follow.mock.calls.length === 1) {
        const shown = rest.filter((event) => event.type === 'token').slice(0, after === undefined ? 4 : 2)
        return frames(...shown, poll)
      }
      return frames(...rest)
    })
    const live = depsOf({
      stream: vi.fn(() => frames(rows[0]!)),
      follow,
    })
    let liveText = ''
    await runTurn(live, 'c1', { text: 'x', accessMode: 'AUTO' }, (event) => {
      if (event.type === 'token') liveText += event.text
    })
    expect(liveText).toBe('안녕하세요 반가워요 끝')
    expect(follow).toHaveBeenNthCalledWith(1, 'c1', 1, undefined)
    expect(follow).toHaveBeenNthCalledWith(2, 'c1', 3, undefined)

    follow.mockClear()
    const stored = {
      jobId: 'j1',
      status: 'RUNNING' as const,
      createdAt: '',
      userMessageId: 'm1',
      assistantMessageId: null,
      answer: null,
      events: [{ type: 'token' as const, text: '안녕하세요 반가워요 끝', seq: 1 }],
    }
    let resumed = ''
    await resumeStoredTurn(depsOf({ follow }), 'c1', stored, (event) => {
      if (event.type === 'token') resumed += event.text
    })
    expect(resumed).toBe('안녕하세요 반가워요 끝')
    expect(follow).toHaveBeenNthCalledWith(1, 'c1', undefined, undefined)
    expect(follow).toHaveBeenNthCalledWith(2, 'c1', 4, undefined)
  })

  it('still rejects a job INTERNAL frame, which carries a seq', async () => {
    const deps = depsOf({
      stream: vi.fn(() =>
        frames({ type: 'error', error: { code: 'INTERNAL', message: 'internal error' }, seq: 4 }),
      ),
    })
    const caught = await runTurn(
      deps,
      'c1',
      { text: 'x', accessMode: 'AUTO' },
      () => undefined,
    ).catch((error: unknown) => error)
    expect(caught).toMatchObject({ code: 'INTERNAL' })
    expect(deps.follow).not.toHaveBeenCalled()
  })

  it('turns an error frame into an ApiError', async () => {
    const deps = depsOf({
      stream: vi.fn(() =>
        frames({
          type: 'error',
          error: { code: 'PLAN_REQUIRED', message: 'pro', details: { requiredPlan: 'PRO' } },
          seq: 1,
        }),
      ),
    })
    const caught = await runTurn(
      deps,
      'c1',
      { text: 'x', accessMode: 'AUTO' },
      () => undefined,
    ).catch((e: unknown) => e)
    expect(chatGateFrom(caught)).toBe('interview')
  })
})

describe('answerApproval', () => {
  it('resolves with the option id and keeps reading the resumed job', async () => {
    const deps = depsOf({
      resolve: vi.fn(async () => ({ jobId: 'j2' })),
      follow: vi
        .fn()
        .mockImplementationOnce(() =>
          frames({
            type: 'tool',
            name: 'publish_posting',
            state: 'ok',
            summary: '공고를 게시해요',
            seq: 1,
          }),
        )
        .mockImplementation(() => frames()),
    })
    const { events, onEvent } = collect()
    await answerApproval(deps, 'c1', 'a1', 'approve', onEvent)
    expect(deps.resolve).toHaveBeenCalledWith('c1', 'a1', 'approve')
    expect(deps.follow).toHaveBeenCalledWith('c1', undefined, undefined)
    expect(events).toHaveLength(1)
  })

  it('passes the abort signal to the resumed job', async () => {
    const controller = new AbortController()
    const deps = depsOf({ resolve: vi.fn(async () => ({ jobId: 'j2' })) })
    await answerApproval(deps, 'c1', 'a1', 'approve', () => undefined, controller.signal)
    expect(deps.follow).toHaveBeenCalledWith('c1', undefined, controller.signal)
  })

  it('stops after resolving when no job was queued', async () => {
    const deps = depsOf()
    await answerApproval(deps, 'c1', 'a1', 'reject', () => undefined)
    expect(deps.follow).not.toHaveBeenCalled()
  })
})

describe('applyTurnEvent', () => {
  it('keeps text, tools and cards in stream order with the saved draft and the awaiting state', () => {
    const events: StreamEvent[] = [
      { type: 'token', text: '초안을 ' },
      { type: 'token', text: '쓸게요' },
      {
        type: 'tool',
        name: 'draft_posting',
        state: 'run',
        summary: '공고 초안 쓰기',
        target: '결제 승인 · 4–6년',
      },
      {
        type: 'tool',
        name: 'draft_posting',
        state: 'ok',
        summary: '공고 초안 쓰기',
        target: '결제 승인 · 4–6년',
        resultLine: '제목 · 하는 일 3',
        result: { draft },
      },
      { type: 'token', text: '저장했어요' },
      {
        type: 'approval',
        id: 'a1',
        kind: 'TOOL_ACTION',
        title: '3명을 면접 단계로 옮길까요?',
        foot: '알림이 가요.',
        args: {
          rows: [
            { name: '김태윤', initial: '태윤', from: '서류 통과', to: '면접' },
            { name: '이름 없음' },
          ],
        },
        options: [
          { id: 'reject', label: '취소' },
          { id: 'approve', label: '옮기기' },
        ],
      },
      { type: 'done', operation: null, awaiting: 'approval' },
    ]
    const turn = events.reduce(applyTurnEvent, EMPTY_TURN)
    expect(turnText(turn)).toBe('초안을 쓸게요저장했어요')
    expect(turn.awaiting).toBe('approval')
    expect(turn.blocks).toEqual([
      { kind: 'text', key: 'text-0', text: '초안을 쓸게요' },
      {
        kind: 'tool',
        key: 'draft_posting-1',
        name: 'draft_posting',
        state: 'ok',
        summary: '공고 초안 쓰기',
        target: '결제 승인 · 4–6년',
        resultLine: '제목 · 하는 일 3',
        postingId: 'p1',
        draft: {
          title: '백엔드 엔지니어',
          description: '결제 API를 만들어요',
          requirements: ['서버 개발 경력'],
          preferred: [],
          workConditions: { 근무: '주 5일' },
        },
      },
      { kind: 'text', key: 'text-2', text: '저장했어요' },
      {
        kind: 'approval',
        id: 'a1',
        title: '3명을 면접 단계로 옮길까요?',
        foot: '알림이 가요.',
        rows: [{ name: '김태윤', initial: '태윤', from: '서류 통과', to: '면접' }],
        options: [
          { id: 'reject', label: '취소' },
          { id: 'approve', label: '옮기기' },
        ],
      },
    ])
  })

  it('updates a waiting tool in place when the resumed job reports it', () => {
    const turn = [
      { type: 'tool', name: 'close_posting', state: 'wait', summary: '공고를 마감해요' },
      {
        type: 'tool',
        name: 'close_posting',
        state: 'err',
        summary: '공고를 마감해요',
        result: { error: 'REVISION_CONFLICT' },
      },
      { type: 'tool', name: 'close_posting', state: 'run', summary: '공고를 마감해요' },
    ].reduce((t, e) => applyTurnEvent(t, e as StreamEvent), EMPTY_TURN)
    expect(turn.blocks.map((block) => (block.kind === 'tool' ? block.state : block.kind))).toEqual([
      'err',
      'run',
    ])
  })

  it('ignores a repeated approval or choice frame', () => {
    const approval: StreamEvent = {
      type: 'approval',
      id: 'a1',
      kind: 'TOOL_ACTION',
      title: 't',
      options: [{ id: 'approve', label: '실행' }],
    }
    const choice: StreamEvent = {
      type: 'choice',
      id: 'need',
      title: '누구예요?',
      recommended: '1',
      options: [{ id: '1', label: '결제' }],
    }
    const turn = [approval, approval, choice, choice].reduce(applyTurnEvent, EMPTY_TURN)
    expect(turn.blocks.map((block) => block.kind)).toEqual(['approval', 'choice'])
  })

  it('shows the queue position until the job starts', () => {
    const queued = applyTurnEvent(EMPTY_TURN, {
      type: 'status',
      text: 'queued',
      ahead: 3,
    } as StreamEvent)
    expect(queued.queued).toBe(3)
    expect(applyTurnEvent(queued, { type: 'token', text: '시작' }).queued).toBeNull()
  })
})

describe('storedTurn', () => {
  it('replays a stored job into ordered blocks and keeps the answered card', () => {
    const { turn, picked } = storedTurn({
      jobId: 'job-1',
      status: 'DONE',
      createdAt: '',
      userMessageId: 'm1',
      assistantMessageId: 'm2',
      answer: { approvalId: 'need', optionId: '2' },
      events: [
        { type: 'token', text: '먼저 찾아볼게요.' },
        {
          type: 'tool',
          name: 'search_company',
          state: 'ok',
          summary: '회사 정보 검색',
          resultLine: '뉴스 4건',
        },
        {
          type: 'choice',
          id: 'need',
          title: '누가 필요해요?',
          options: [
            { id: '1', label: '한 명' },
            { id: '2', label: '두 명' },
          ],
        },
      ],
    })
    expect(turn.blocks.map((block) => block.kind)).toEqual(['text', 'tool', 'choice'])
    expect(picked).toEqual({ need: '2' })
  })
})

describe('cancelTurn', () => {
  it('cancels the job on the server', async () => {
    const deps = depsOf()
    await cancelTurn(deps, 'c1')
    expect(deps.cancel).toHaveBeenCalledWith('c1')
  })

  it('treats 409 as a job that already ended and raises any other failure', async () => {
    const ended = depsOf({
      cancel: vi.fn(async () => {
        throw new ApiError('no active stream', 'CONFLICT', 409)
      }),
    })
    await expect(cancelTurn(ended, 'c1')).resolves.toBeUndefined()
    const down = depsOf({
      cancel: vi.fn(async () => {
        throw new ApiError('internal', 'INTERNAL', 500)
      }),
    })
    await expect(cancelTurn(down, 'c1')).rejects.toMatchObject({ status: 500 })
  })
})

describe('approval row colour', () => {
  const rowsOf = (color: unknown) => {
    const turn = applyTurnEvent(EMPTY_TURN, {
      type: 'approval',
      id: 'a1',
      kind: 'TOOL_ACTION',
      title: '단계를 바꿔요',
      summary: '단계를 바꿔요',
      toolName: 'change_applicant_stage',
      args: { rows: [{ name: '김태윤', initial: '태윤', from: '서류', to: '면접', color }] },
      options: [{ id: 'approve', label: '실행' }],
    } as StreamEvent)
    const card = turn.blocks[0]
    return card?.kind === 'approval' ? card.rows : []
  }

  it('keeps a hex colour and drops anything that could break out of the style attribute', () => {
    expect(rowsOf('#3B5BDB')[0]?.color).toBe('#3B5BDB')
    expect(rowsOf('red; background:url(x)')[0]?.color).toBeUndefined()
    expect(rowsOf('url(javascript:x)')[0]?.color).toBeUndefined()
  })
})
