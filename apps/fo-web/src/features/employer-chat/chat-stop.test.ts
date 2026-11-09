import { ApiError, type ConversationTurn, type StreamEvent } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { acceptedFailure } from './chat-gate'
import { threadItems } from './chat-thread'
import {
  applyTurnEvent,
  EMPTY_TURN,
  lastSeq,
  markStarted,
  markStopped,
  storedTurn,
  turnRunning,
  type TurnTool,
} from './chat-turn'

const running: StreamEvent = { type: 'tool', name: 'list_applicants', state: 'run', summary: '지원자 보기', seq: 2 }

const stored = (status: ConversationTurn['status'], events: ConversationTurn['events']): ConversationTurn => ({
  jobId: 'j1',
  status,
  createdAt: '',
  userMessageId: 'm1',
  assistantMessageId: null,
  answer: null,
  events,
})

const tools = (blocks: { kind: string }[]) => blocks.filter((block): block is TurnTool => block.kind === 'tool')

describe('a job that ends without done', () => {
  it('ends the running tool row as stopped on a cancelled frame, the way push-be stores it', () => {
    const { turn } = storedTurn(stored('CANCELLED', [running, { type: 'cancelled', seq: 3 }]))
    expect(tools(turn.blocks).map((tool) => tool.state)).toEqual(['stop'])
    expect(turn.ended).toBe('stopped')
  })

  it('ends it as failed on an error frame and leaves finished rows alone', () => {
    const ok: StreamEvent = { type: 'tool', name: 'read', state: 'ok', summary: '읽기' }
    const turn = [ok, running, { type: 'error', error: { code: 'INTERNAL', message: 'x' } } as StreamEvent].reduce(
      applyTurnEvent,
      EMPTY_TURN,
    )
    expect(tools(turn.blocks).map((tool) => tool.state)).toEqual(['ok', 'stop'])
    expect(turn.ended).toBe('failed')
  })

  it('reads the job status when no frame says so (cancelled while queued)', () => {
    expect(storedTurn(stored('CANCELLED', [running])).turn.ended).toBe('stopped')
    expect(storedTurn(stored('FAILED', [running])).turn.ended).toBe('failed')
    expect(storedTurn(stored('RUNNING', [running])).turn.ended).toBeNull()
  })

  it('knows a running job and where to follow it from', () => {
    expect(turnRunning(stored('PENDING', []))).toBe(true)
    expect(turnRunning(stored('RUNNING', []))).toBe(true)
    expect(turnRunning(stored('CANCELLED', []))).toBe(false)
    expect(lastSeq(stored('RUNNING', [{ type: 'token', text: 'a', seq: 4 }, running]))).toBe(2)
    expect(lastSeq(stored('RUNNING', []))).toBeUndefined()
  })
})

describe('stop before the job starts', () => {
  it('sends the cancel only once the job has its first frame, and only once', () => {
    const run = { started: false, stopped: false }
    expect(markStopped(run)).toBe(false)
    expect(markStarted(run)).toBe(true)
    expect(markStarted(run)).toBe(false)
    expect(markStopped(run)).toBe(false)
  })

  it('sends it at once when the job already runs', () => {
    const run = { started: false, stopped: false }
    expect(markStarted(run)).toBe(false)
    expect(markStopped(run)).toBe(true)
  })
})

describe('acceptedFailure', () => {
  it('keeps the question when the connection drops or the job crashes after push-be took it', () => {
    expect(acceptedFailure(new TypeError('network'))).toBe('dropped')
    expect(acceptedFailure(new ApiError('x', 'NETWORK_ERROR', 0))).toBe('dropped')
    expect(acceptedFailure(new ApiError('x', 'INTERNAL', 0))).toBe('kept')
    expect(acceptedFailure(new ApiError('x', 'NOT_CONFIGURED', 0))).toBe('kept')
  })

  it('leaves a DomainError rejection to the normal failure path (push-be removed the question)', () => {
    expect(acceptedFailure(new ApiError('x', 'INSUFFICIENT_CREDITS', 0))).toBeNull()
    expect(acceptedFailure(new ApiError('x', 'PLAN_REQUIRED', 0))).toBeNull()
  })
})

describe('threadItems while following a running job', () => {
  it('shows the job once, as the live turn under its stored question', () => {
    const question = { id: 'm1', conversationId: 'c1', role: 'USER' as const, text: '정리해 줘', attachments: [], operationId: null, createdAt: '' }
    const job = stored('RUNNING', [running])
    const live = { text: '', attachments: [], turn: storedTurn(job).turn, known: ['m1'], jobId: 'j1' }
    expect(threadItems([question], [job], live).map((item) => item.key)).toEqual(['m1', 'live-turn'])
  })
})
