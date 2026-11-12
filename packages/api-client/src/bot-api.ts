import type { Client } from './client'
import { TERMINAL_STREAM_EVENTS } from './constants'
import { ApiError } from './errors'
import { readEvents } from './sse'
import type {
  Bot, BotDetail, BotList, BotSearch, CancelResult, CardAnswer, CardAnswerBody, CardRetry, CreateBotBody, LinkPreview,
  MaterialDetail, MaterialKind, MaterialsPage, MaterialsQuery, Page, SendBody, StreamEvent, Transcript, TranscriptMatches, UpdateBotBody,
} from './bot-contract'
import type { DataEnvelope, PageParams } from './types'

const HTTP_CREATED = 201
const HTTP_ACCEPTED = 202
const HTTP_NO_CONTENT = 204
const EVENT_STREAM = { Accept: 'text/event-stream' }

const unwrap = async <T>(p: Promise<DataEnvelope<T>>) => (await p).data

const withStatus = async <T>(p: Promise<Response>) => {
  const res = await p
  return { status: res.status, data: ((await res.json()) as DataEnvelope<T>).data }
}

const frames = (res: Response, signal?: AbortSignal) => {
  if (!res.body) throw new ApiError('empty stream', 'NETWORK_ERROR', 0)
  return readEvents<StreamEvent>(res.body, signal)
}

/** `id` on every bot route is a bot id or `push`, the caller's Push Bot. */
export const createBotApi = (c: Client) => ({
  bots: {
    list: (query?: { postingId?: string }) => c.get<BotList>('bots', { query }),
    search: (q: string, page: PageParams = {}) => c.get<{ data: BotSearch; page: Page }>('bots/search', { query: { q, ...page } }),
    /** `created` is false when the caller already had a bot for the posting's company and the server returned it. */
    create: async (body: CreateBotBody) => {
      const { status, data } = await withStatus<Bot>(c.raw('POST', 'bots', { body }))
      return { bot: data, created: status === HTTP_CREATED }
    },
    linkPreview: (url: string) => unwrap(c.post<DataEnvelope<LinkPreview>>('bots/link-preview', { body: { url } })),
    get: (id: string) => unwrap(c.get<DataEnvelope<BotDetail>>(`bots/${id}`)),
    update: (id: string, body: UpdateBotBody) => unwrap(c.patch<DataEnvelope<Bot>>(`bots/${id}`, { body })),
    remove: (id: string) => c.delete<void>(`bots/${id}`),
    markRead: (id: string) => unwrap(c.post<DataEnvelope<{ readAt: string }>>(`bots/${id}/read`)),

    transcript: (id: string, page: PageParams = {}) => c.get<Transcript>(`bots/${id}/transcript`, { query: page }),
    clearChat: (id: string) => c.delete<void>(`bots/${id}/transcript`),
    findInChat: (id: string, q: string) =>
      unwrap(c.get<DataEnvelope<TranscriptMatches>>(`bots/${id}/transcript/matches`, { query: { q } })),

    send: async function* (id: string, body: SendBody, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
      yield* frames(await c.raw('POST', `bots/${id}/messages/stream`, { body, signal, headers: EVENT_STREAM }), signal)
    },
    /** Ends without a terminal event only when the server says nothing runs. The newest transcript page then holds how the run ended. */
    follow: async function* (id: string, after?: number, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
      let seq = after
      for (;;) {
        const res = await c.raw('GET', `bots/${id}/stream`, { query: { after: seq }, signal, headers: EVENT_STREAM })
        if (res.status === HTTP_NO_CONTENT) return
        for await (const frame of frames(res, signal)) {
          const event: StreamEvent = frame
          if (event.seq !== undefined) seq = event.seq
          yield event
          if (TERMINAL_STREAM_EVENTS.includes(event.type)) return
        }
      }
    },
    cancel: (id: string) => unwrap(c.post<DataEnvelope<CancelResult>>(`bots/${id}/stream/cancel`)),
    /** `resumed` means the answer started the run again: follow the stream. */
    answer: async (id: string, cardId: string, body: CardAnswerBody) => {
      const { status, data } = await withStatus<CardAnswer>(c.raw('POST', `bots/${id}/approvals/${cardId}`, { body }))
      return { answer: data, resumed: status === HTTP_ACCEPTED }
    },
    retryCard: (id: string, cardId: string) => unwrap(c.post<DataEnvelope<CardRetry>>(`bots/${id}/approvals/${cardId}/retry`)),
  },

  materials: {
    list: (query: MaterialsQuery = {}) => unwrap(c.get<DataEnvelope<MaterialsPage>>('materials', { query })),
    get: (kind: MaterialKind, id: string) => unwrap(c.get<DataEnvelope<MaterialDetail>>(`materials/${kind}/${id}`)),
    remove: (kind: MaterialKind, id: string) => c.delete<void>(`materials/${kind}/${id}`),
  },
})

export type BotApi = ReturnType<typeof createBotApi>
