import { ApiError, type AccessMode, type ApprovalResolution, type ChatIntent, type StreamEvent, type StreamOption, type ToolRunState } from '@push/api-client'
import { toPostingDraft, type PostingDraft } from '../../shared/model/employer-chat'
import { DRAFT_TOOL, PENDING_TOOL_STATES } from './constants'

export type TurnBody = { text: string; accessMode: AccessMode; intent?: ChatIntent; applicationId?: string }

export type TurnDeps = {
  stream: (id: string, body: TurnBody) => AsyncIterable<StreamEvent>
  follow: (id: string, after?: number) => AsyncIterable<StreamEvent>
  resolve: (id: string, approvalId: string, optionId: string) => Promise<Pick<ApprovalResolution, 'jobId'>>
}

export type TurnTool = {
  kind: 'tool'
  key: string
  name: string
  state: ToolRunState
  summary: string
  error?: string
  draft?: PostingDraft
  postingId?: string
}

export type TurnApproval = { kind: 'approval'; id: string; title: string; options: StreamOption[] }

export type TurnItem = TurnTool | TurnApproval

export type ChatTurn = { text: string; items: TurnItem[]; awaiting: 'approval' | 'choice' | null }

export const EMPTY_TURN: ChatTurn = { text: '', items: [], awaiting: null }

const recordOf = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const toolItem = (event: Extract<StreamEvent, { type: 'tool' }>, key: string): TurnTool => {
  const result = recordOf(event.result)
  const draft = event.name === DRAFT_TOOL && event.state === 'ok' ? toPostingDraft(result.draft) : null
  const postingId = recordOf(result.draft).id
  return {
    kind: 'tool',
    key,
    name: event.name,
    state: event.state,
    summary: event.summary,
    ...(typeof result.error === 'string' ? { error: result.error } : {}),
    ...(draft ? { draft, ...(typeof postingId === 'string' ? { postingId } : {}) } : {}),
  }
}

const upsertTool = (items: TurnItem[], event: Extract<StreamEvent, { type: 'tool' }>) => {
  const index = items
    .map((item) => item.kind === 'tool' && item.name === event.name && PENDING_TOOL_STATES.includes(item.state))
    .lastIndexOf(true)
  if (index < 0) return [...items, toolItem(event, `${event.name}-${items.length}`)]
  return items.map((item, i) => (i === index ? toolItem(event, item.kind === 'tool' ? item.key : '') : item))
}

export const applyTurnEvent = (turn: ChatTurn, event: StreamEvent): ChatTurn => {
  switch (event.type) {
    case 'token':
      return { ...turn, text: turn.text + event.text }
    case 'tool':
      return { ...turn, items: upsertTool(turn.items, event) }
    case 'approval':
      if (turn.items.some((item) => item.kind === 'approval' && item.id === event.id)) return turn
      return { ...turn, items: [...turn.items, { kind: 'approval', id: event.id, title: event.title, options: event.options }] }
    case 'done':
      return { ...turn, awaiting: event.awaiting ?? null }
    default:
      return turn
  }
}

const streamError = (error: { code: string; message: string; details?: unknown }) => {
  const details = recordOf(error.details)
  return new ApiError(error.message, error.code, 0, Object.keys(details).length ? details : null)
}

const consume = async (source: AsyncIterable<StreamEvent>, onEvent: (event: StreamEvent) => void) => {
  let seq: number | undefined
  for await (const event of source) {
    if (event.type === 'error') throw streamError(event.error)
    if (event.seq !== undefined) seq = event.seq
    onEvent(event)
    if (event.type === 'done' || event.type === 'cancelled') return { ended: true, seq }
  }
  return { ended: false, seq }
}

export const runTurn = async (deps: TurnDeps, id: string, body: TurnBody, onEvent: (event: StreamEvent) => void) => {
  const first = await consume(deps.stream(id, body), onEvent)
  if (!first.ended) await consume(deps.follow(id, first.seq), onEvent)
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
