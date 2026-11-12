import type { AccessMode, AiOptions, CardResolution, ChatIntent, LinkKind, StreamEvent as ConversationEvent } from './types'

export type BotKind = 'push' | 'company'
export type BotColor = 'teal' | 'sky' | 'blue' | 'violet' | 'pink' | 'red' | 'coral' | 'amber' | 'green' | 'brown' | 'gray'

/** `since` is the run's start for queued, thinking, and working, and the card's asking time for waiting. */
export type BotActivity =
  | { phase: 'queued'; since: string; ahead: number }
  | { phase: 'thinking'; since: string; label: string | null }
  | { phase: 'working'; since: string; label: string }
  | { phase: 'waiting'; since: string; for: 'answer' | 'confirm'; cardId: string; cardTitle: string; expiresAt: string | null }

export type Bot = {
  id: string
  kind: BotKind
  displayName: string
  companyName: string
  /** Null exactly when kind is push. */
  color: BotColor | null
  postingId: string | null
  notificationsMuted: boolean
  revision: number
  createdAt: string
  lastActivityAt: string
  lastMessage: { preview: string; at: string; fromBot: boolean } | null
  unread: boolean
  activity: BotActivity | null
}

/** `max` null is unlimited. The Push Bot is not counted. */
export type BotLimit = {
  plan: 'FREE' | 'PRO' | 'ULTRA'
  max: number | null
  used: number
  table: { FREE: number; PRO: number; ULTRA: number | null }
}

/** `limit` comes with the unfiltered list only. */
export type BotList = { data: Bot[]; limit?: BotLimit }

export type BotDetail = Bot & {
  posting: { id: string; title: string; deadline: string | null; closed: boolean } | null
  fit: { score: number } | null
  /** Missing until the server counts materials. */
  materialCount?: number
}

export type BotRef = { id: string; kind: BotKind; displayName: string; color: BotColor | null }

export type CreateBotBody = { postingId: string; displayName?: string; color?: BotColor }
export type UpdateBotBody = { expectedRevision: number; displayName?: string; notificationsMuted?: boolean; color?: BotColor }

export type Page = { nextCursor: string | null; hasMore: boolean }

export type BotSearch = {
  bots: (Bot & { line: string })[]
  botTotal: number
  messages: { bot: BotRef; messageId: string; at: string; role: 'USER' | 'ASSISTANT'; snippet: string }[]
  messageTotal: number
}

export type LinkPreview =
  | {
      status: 'found'
      postingId: string
      company: string
      title: string
      deadline: string | null
      careerMin: number | null
      careerMax: number | null
      location: string | null
      host: string
    }
  | { status: 'not_a_posting' }

export type MaterialKind = 'file' | 'document' | 'posting' | 'link'
/** `doc` holds files and documents, `bookmark` holds postings. */
export type MaterialSection = 'doc' | 'bookmark' | 'link'

export type AttachmentRef = { kind: MaterialKind; id: string }
/** `title` is a snapshot taken when the message was stored. */
export type Attachment = AttachmentRef & { title: string }

export type Intent = Exclude<ChatIntent, 'posting' | 'review' | 'interview' | 'general'>

export type SendBody = {
  text: string
  attachments?: AttachmentRef[]
  intent?: Intent
  accessMode?: AccessMode
  ai?: AiOptions
}

type Stamp = { seq: number; at: string }

type Status =
  | { type: 'status'; text: string; phase: 'queued'; since: string; ahead: number }
  | { type: 'status'; text: string; phase: 'thinking' | 'working'; since: string }
  | { type: 'status'; text: string; phase: 'waiting'; since: string; for: 'answer' | 'confirm'; cardId: string }

type Unchanged = Exclude<ConversationEvent, { type: 'status' | 'done' | 'cancelled' | 'error' | 'approval' | 'choice' }>
type Approval = Omit<Extract<ConversationEvent, { type: 'approval' }>, 'seq' | 'resolution'>
type Choice = Omit<Extract<ConversationEvent, { type: 'choice' }>, 'seq' | 'resolution'>
type Progress = Unchanged | Status | { type: 'notice'; text: string } | { type: 'cancelled'; resumable: boolean }
type Done = { type: 'done'; operation: unknown; awaiting?: 'approval' | 'choice'; sources?: Attachment[] }
type Failure = { type: 'error'; error: { code: string; message: string; details?: unknown } }

/**
 * A frame of a live bot stream. `turn` equals the `Turn.id` the frame is stored under.
 * An error the stream itself raises (a failed poll, an unreadable frame) is not a stored event and has no stamp.
 */
export type StreamEvent =
  | ((Progress | (Approval & { expiresAt?: string }) | Choice | Done) & Stamp & { turn: string })
  | (Failure & Partial<Stamp & { turn: string }>)

/** An event of a stored turn. A card carries the facts of its row, so a card asked again reads the same after a reopen. */
export type TurnEvent = (
  | Progress
  | ((Approval | Choice) & { resolution: CardResolution; openedAt: string; expiresAt: string | null; retryable: boolean })
  | Failure
) &
  Stamp

export type Turn = {
  id: string
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED' | 'CANCELLED'
  createdAt: string
  /** Null for a card answer. */
  user: { messageId: string; text: string; attachments: Attachment[] } | null
  answer: { approvalId: string; optionId: string | null; optionIds?: string[] } | null
  events: TurnEvent[]
  assistant: { messageId: string; text: string; sources: Attachment[] } | null
}

/** Newest turn first. `live` is set on the first page while a run is under way: reattach after `lastSeq`. */
export type Transcript = {
  data: Turn[]
  page: Page
  live: { turnId: string; lastSeq: number } | null
}

export type TranscriptMatch = { messageId: string; turnId: string; at: string }
export type TranscriptMatches = { total: number; items: TranscriptMatch[] }

export type CancelResult = { status: 'CANCELLED'; resumable: boolean }

export type CardAnswerBody = { optionId: string; optionIds?: string[] } | { optionId?: string; optionIds: string[] }
export type CardAnswer = { id: string; status: 'APPROVED' | 'REJECTED'; optionId: string }
export type CardRetry = { id: string; status: 'PENDING'; openedAt: string; expiresAt: string }

export type Material =
  | {
      kind: 'file'
      id: string
      title: string
      mimeType: string
      size: number
      pageCount: number | null
      origin: 'UPLOAD' | 'AI'
      createdBy: BotRef | null
      updatedAt: string
    }
  | { kind: 'document'; id: string; title: string; docKind: string; origin: 'UPLOAD' | 'AI'; createdBy: BotRef | null; updatedAt: string }
  | {
      kind: 'posting'
      id: string
      title: string
      company: string
      deadline: string | null
      closed: boolean
      careerMin: number | null
      careerMax: number | null
      employmentType: string | null
      location: string | null
      bookmarkedAt: string
    }
  | {
      kind: 'link'
      id: string
      title: string
      url: string
      /** The url's host in lower case. The LinkedIn mark comes from it, because LinkedIn is not a link kind. */
      host: string
      linkKind: LinkKind
      addedAt: string
      lastCheckedAt: string | null
      lastCheckOk: boolean | null
    }

/** `bot` is a bot id or `push`, and keeps the materials that bot made or that were attached in its chat. */
export type MaterialsQuery = { tab?: 'all' | MaterialSection; q?: string; bot?: string; cursor?: string; limit?: number }

/** `counts` always holds all three sections, counted after `q` and `bot`. The `all` tab holds a preview of each section and no cursor. */
export type MaterialsPage = {
  counts: Record<MaterialSection, number>
  sections: { section: MaterialSection; items: Material[]; nextCursor: string | null }[]
}

export type MaterialDetail = Material & { usedBy: BotRef[] }
