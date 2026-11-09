import {
  ApiError,
  type AccessMode,
  type ApprovalResolution,
  type ChatIntent,
  type ConversationTurn,
  type StreamEvent,
  type StreamOption,
  type ToolRunState,
} from '@push/api-client'
import { toPostingDraft, type PostingDraft } from '../../shared/model/employer-chat'
import { DRAFT_TOOL, PENDING_TOOL_STATES } from './constants'

export type TurnBody = {
  text: string
  accessMode: AccessMode
  intent?: ChatIntent
  applicationId?: string
}

export type TurnDeps = {
  stream: (id: string, body: TurnBody, signal?: AbortSignal) => AsyncIterable<StreamEvent>
  follow: (id: string, after?: number, signal?: AbortSignal) => AsyncIterable<StreamEvent>
  resolve: (
    id: string,
    approvalId: string,
    optionId: string,
  ) => Promise<Pick<ApprovalResolution, 'jobId'>>
}

export type TurnText = { kind: 'text'; key: string; text: string }

export type TurnTool = {
  kind: 'tool'
  key: string
  name: string
  state: ToolRunState
  summary: string
  target?: string
  resultLine?: string
  extra?: string[]
  error?: string
  draft?: PostingDraft
  postingId?: string
}

export type MoveRow = { name: string; initial: string; color?: string; from: string; to: string }

export type TurnApproval = {
  kind: 'approval'
  id: string
  title: string
  options: StreamOption[]
  rows: MoveRow[]
  foot?: string
}

export type TurnChoice = {
  kind: 'choice'
  id: string
  title?: string
  options: StreamOption[]
  recommended?: string
}

export type TurnPlan = {
  kind: 'plan'
  id: string
  rows: { tag: string; label: string; note: string }[]
}

export type TurnBlock = TurnText | TurnTool | TurnApproval | TurnChoice | TurnPlan

export type ChatTurn = {
  blocks: TurnBlock[]
  awaiting: 'approval' | 'choice' | null
  queued: number | null
}

export const EMPTY_TURN: ChatTurn = { blocks: [], awaiting: null, queued: null }

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const text = (value: unknown) => (typeof value === 'string' ? value : undefined)

const moveRows = (args: unknown): MoveRow[] => {
  const rows = recordOf(args).rows
  if (!Array.isArray(rows)) return []
  return rows.flatMap((row) => {
    const item = recordOf(row)
    const [name, initial, from, to] = [
      text(item.name),
      text(item.initial),
      text(item.from),
      text(item.to),
    ]
    if (!name || !from || !to) return []
    return [
      {
        name,
        initial: initial ?? name,
        from,
        to,
        ...(text(item.color) ? { color: text(item.color) } : {}),
      },
    ]
  })
}

const toolBlock = (event: Extract<StreamEvent, { type: 'tool' }>, key: string): TurnTool => {
  const result = recordOf(event.result)
  const draft =
    event.name === DRAFT_TOOL && event.state === 'ok' ? toPostingDraft(result.draft) : null
  const postingId = recordOf(result.draft).id
  return {
    kind: 'tool',
    key,
    name: event.name,
    state: event.state,
    summary: event.summary,
    ...(event.target ? { target: event.target } : {}),
    ...(event.resultLine ? { resultLine: event.resultLine } : {}),
    ...(event.extra?.length ? { extra: event.extra } : {}),
    ...(typeof result.error === 'string' ? { error: result.error } : {}),
    ...(draft ? { draft, ...(typeof postingId === 'string' ? { postingId } : {}) } : {}),
  }
}

const upsertTool = (blocks: TurnBlock[], event: Extract<StreamEvent, { type: 'tool' }>) => {
  const index = blocks
    .map(
      (block) =>
        block.kind === 'tool' &&
        block.name === event.name &&
        PENDING_TOOL_STATES.includes(block.state),
    )
    .lastIndexOf(true)
  if (index < 0) return [...blocks, toolBlock(event, `${event.name}-${blocks.length}`)]
  return blocks.map((block, i) =>
    i === index ? toolBlock(event, block.kind === 'tool' ? block.key : '') : block,
  )
}

const appendText = (blocks: TurnBlock[], value: string): TurnBlock[] => {
  const last = blocks.at(-1)
  if (last?.kind === 'text') return [...blocks.slice(0, -1), { ...last, text: last.text + value }]
  return [...blocks, { kind: 'text', key: `text-${blocks.length}`, text: value }]
}

const hasCard = (blocks: TurnBlock[], kind: 'approval' | 'choice', id: string) =>
  blocks.some((block) => block.kind === kind && block.id === id)

const queuedAhead = (event: Extract<StreamEvent, { type: 'status' }>, current: number | null) => {
  if (event.text !== 'queued') return null
  const ahead = recordOf(event).ahead
  return typeof ahead === 'number' ? ahead : (current ?? 0)
}

export const applyTurnEvent = (turn: ChatTurn, event: StreamEvent): ChatTurn => {
  switch (event.type) {
    case 'status':
      return { ...turn, queued: queuedAhead(event, turn.queued) }
    case 'token':
      return { ...turn, queued: null, blocks: appendText(turn.blocks, event.text) }
    case 'tool':
      return { ...turn, queued: null, blocks: upsertTool(turn.blocks, event) }
    case 'approval':
      if (hasCard(turn.blocks, 'approval', event.id)) return turn
      return {
        ...turn,
        blocks: [
          ...turn.blocks,
          {
            kind: 'approval',
            id: event.id,
            title: event.title,
            options: event.options,
            rows: moveRows(event.args),
            ...(event.foot ? { foot: event.foot } : {}),
          },
        ],
      }
    case 'choice':
      if (hasCard(turn.blocks, 'choice', event.id)) return turn
      return {
        ...turn,
        blocks: [
          ...turn.blocks,
          {
            kind: 'choice',
            id: event.id,
            options: event.options,
            ...(event.title ? { title: event.title } : {}),
            ...(event.recommended ? { recommended: event.recommended } : {}),
          },
        ],
      }
    case 'plan':
      return { ...turn, blocks: [...turn.blocks, { kind: 'plan', id: event.id, rows: event.rows }] }
    case 'done':
      return { ...turn, queued: null, awaiting: event.awaiting ?? null }
    default:
      return turn
  }
}

const storedAnswers = (turn: ConversationTurn): Record<string, string> => {
  const picked: Record<string, string> = {}
  for (const event of turn.events) {
    if ((event.type === 'approval' || event.type === 'choice') && event.resolution?.optionId)
      picked[event.id] = event.resolution.optionId
  }
  if (turn.answer?.optionId) picked[turn.answer.approvalId] = turn.answer.optionId
  return picked
}

/** A job from GET .../turns replayed into the same blocks a live stream builds, with the cards it already answered. */
export const storedTurn = (turn: ConversationTurn) => ({
  turn: turn.events.reduce<ChatTurn>(
    (current, event) => applyTurnEvent(current, event),
    EMPTY_TURN,
  ),
  picked: storedAnswers(turn),
})

export const turnText = (turn: ChatTurn) =>
  turn.blocks.flatMap((block) => (block.kind === 'text' ? [block.text] : [])).join('')

const streamError = (error: { code: string; message: string; details?: unknown }) => {
  const details = recordOf(error.details)
  return new ApiError(error.message, error.code, 0, Object.keys(details).length ? details : null)
}

const consume = async (
  source: AsyncIterable<StreamEvent>,
  onEvent: (event: StreamEvent) => void,
) => {
  let seq: number | undefined
  for await (const event of source) {
    if (event.type === 'error') throw streamError(event.error)
    if (event.seq !== undefined) seq = event.seq
    onEvent(event)
    if (event.type === 'done' || event.type === 'cancelled') return { ended: true, seq }
  }
  return { ended: false, seq }
}

export const runTurn = async (
  deps: TurnDeps,
  id: string,
  body: TurnBody,
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal,
) => {
  const first = await consume(deps.stream(id, body, signal), onEvent)
  if (!first.ended && !signal?.aborted) await consume(deps.follow(id, first.seq, signal), onEvent)
}

export const answerApproval = async (
  deps: TurnDeps,
  id: string,
  approvalId: string,
  optionId: string,
  onEvent: (event: StreamEvent) => void,
) => {
  const { jobId } = await deps.resolve(id, approvalId, optionId)
  if (jobId) await consume(deps.follow(id), onEvent)
}
