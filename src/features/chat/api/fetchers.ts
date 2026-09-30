import { api, ApiError, toApiError } from '@/shared/api'
import { request } from '@/shared/api'
import type { DataEnvelope, ListEnvelope, ListParams } from '@/shared/api'
import { newIdempotencyKey } from '@/shared/lib/id'
import type {
  Approval,
  ApprovalStatus,
  ApprovalSummary,
  CliProvider,
  CliRun,
  Conversation,
  Message,
  MessageStreamEvent,
  ProjectBlueprint,
  ProjectEvidence,
  SendMessageBody,
} from './schemas'

export const listConversations = async (
  params: ListParams & { applicationId?: string } = {},
): Promise<ListEnvelope<Conversation>> =>
  request(() =>
    api.get('conversations', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const createConversation = async (body: {
  applicationId: string | null
  title?: string
}): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.post('conversations', {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const patchConversation = async (
  id: string,
  expectedRevision: number,
  patch: { title?: string; pinned?: boolean },
): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.patch(`conversations/${id}`, {
      json: { expectedRevision, ...patch },
    }),
  )
  return env.data
}

export const archiveConversation = async (
  id: string,
  expectedRevision: number,
): Promise<Conversation> => {
  const env = await request<DataEnvelope<Conversation>>(() =>
    api.post(`conversations/${id}/archive`, {
      json: { expectedRevision },
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const listMessages = async (
  conversationId: string,
  params: ListParams = {},
): Promise<ListEnvelope<Message>> =>
  request(() =>
    api.get(`conversations/${conversationId}/messages`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )

export const streamMessage = async function* (
  conversationId: string,
  body: SendMessageBody,
  options: { signal?: AbortSignal; byokKey?: string } = {},
): AsyncGenerator<MessageStreamEvent> {
  let resp: Response
  try {
    resp = await api.post(`conversations/${conversationId}/messages/stream`, {
      json: body,
      headers: {
        'Idempotency-Key': newIdempotencyKey(),
        ...(options.byokKey ? { 'X-Byok-Key': options.byokKey } : {}),
      },
      timeout: false,
      signal: options.signal,
    })
  } catch (error) {
    throw await toApiError(error)
  }
  yield* readEvents(resp, options.signal)
}

export const streamActive = async function* (
  conversationId: string,
  options: { signal?: AbortSignal; after?: number } = {},
): AsyncGenerator<MessageStreamEvent> {
  let resp: Response
  try {
    resp = await api.get(
      `conversations/${conversationId}/messages/stream/active`,
      {
        timeout: false,
        signal: options.signal,
        searchParams: {
          ...(options.after ? { after: options.after } : {}),
        },
      },
    )
  } catch (error) {
    throw await toApiError(error)
  }
  if (resp.status === 204) return
  yield* readEvents(resp, options.signal)
}

const readEvents = async function* (
  resp: Response,
  signal?: AbortSignal,
): AsyncGenerator<MessageStreamEvent> {
  if (!resp.body) throw new ApiError('empty stream', 'NETWORK_ERROR', 0)
  const reader = resp.body.getReader()
  signal?.addEventListener('abort', () => void reader.cancel())
  const decoder = new TextDecoder()
  let buf = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    let idx = buf.indexOf('\n\n')
    while (idx >= 0) {
      yield* parseFrame(buf.slice(0, idx))
      buf = buf.slice(idx + 2)
      idx = buf.indexOf('\n\n')
    }
  }
  if (buf.trim()) yield* parseFrame(buf)
}

const parseFrame = function* (frame: string): Generator<MessageStreamEvent> {
  for (const line of frame.split('\n')) {
    if (!line.startsWith('data: ')) continue
    try {
      yield JSON.parse(line.slice(6)) as MessageStreamEvent
    } catch {
      yield { type: 'error', error: { code: 'STREAM_PARSE', message: 'malformed stream frame' } }
    }
  }
}

export const getApproval = async (id: string): Promise<ApprovalSummary> =>
  request(() => api.get(`approvals/${id}`))

export const listApprovals = async (
  params: ListParams & { applicationId?: string; status?: ApprovalStatus } = {},
): Promise<ListEnvelope<Approval>> =>
  request(() =>
    api.get('approvals', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    }),
  )

export const decideApproval = async (
  id: string,
  body: { expectedRevision: number; decision: 'APPROVED' | 'DENIED' },
): Promise<Approval> => {
  const env = await request<DataEnvelope<Approval>>(() =>
    api.post(`approvals/${id}/decision`, { json: body }),
  )
  return env.data
}

export const listProjects = async (
  params: ListParams & { applicationId?: string } = {},
): Promise<ListEnvelope<ProjectBlueprint>> =>
  request(() =>
    api.get('projects', {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
        ...(params.applicationId ? { applicationId: params.applicationId } : {}),
      },
    }),
  )

export const listProjectRuns = async (
  projectId: string,
  params: ListParams = {},
): Promise<ListEnvelope<CliRun>> =>
  request(() =>
    api.get(`projects/${projectId}/runs`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )

export const createProjectRun = async (
  projectId: string,
  body: {
    provider: CliProvider
    workingDirectory: string
    prompt: string
  },
): Promise<CliRun> => {
  const env = await request<DataEnvelope<CliRun>>(() =>
    api.post(`projects/${projectId}/runs`, {
      json: body,
      headers: { 'Idempotency-Key': newIdempotencyKey() },
    }),
  )
  return env.data
}

export const listProjectEvidence = async (
  projectId: string,
  params: ListParams = {},
): Promise<ListEnvelope<ProjectEvidence>> =>
  request(() =>
    api.get(`projects/${projectId}/evidence`, {
      searchParams: {
        ...(params.limit ? { limit: params.limit } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {}),
      },
    }),
  )
