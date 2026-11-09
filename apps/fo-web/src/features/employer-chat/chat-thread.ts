import type { ConversationTurn, Message } from '@push/api-client'
import { storedTurn, type ChatTurn } from './chat-turn'

export type Attachment = Message['attachments'][number]

/** `text` is empty when the live turn only follows an answer to a card already on screen. */
export type LiveTurn = {
  text: string
  attachments: Attachment[]
  turn: ChatTurn | null
  /** Ids of the stored messages already there when the run started: the ones it adds are shown by the live turn. */
  known: string[]
}

export type ThreadItem =
  | { kind: 'user'; key: string; text: string; attachments: Attachment[] }
  | { kind: 'turn'; key: string; turn: ChatTurn; picked: Record<string, string>; live: boolean }
  | { kind: 'reply'; key: string; text: string }

/**
 * One ordered list for the thread: stored messages, the stored jobs from GET .../turns in place of the assistant
 * messages they produced, and the turn streaming now. push-be pages messages newest first, so they are reversed here.
 * The live turn replaces the messages stored since it began (its own question and the reply), so nothing shows twice.
 */
export const threadItems = (
  messages: Message[],
  turns: ConversationTurn[],
  live: LiveTurn | null,
): ThreadItem[] => {
  const known = live && new Set(live.known)
  const rows = [...messages].reverse().filter((message) => !known || known.has(message.id))
  const shown = new Set<string>()
  const replay = (turn: ConversationTurn): ThreadItem => {
    shown.add(turn.jobId)
    return { kind: 'turn', key: turn.jobId, live: false, ...storedTurn(turn) }
  }
  const items = rows.flatMap((message): ThreadItem[] => {
    if (message.role === 'USER') {
      const own = turns.find((turn) => turn.userMessageId === message.id && !shown.has(turn.jobId))
      const user: ThreadItem = {
        kind: 'user',
        key: message.id,
        text: message.text,
        attachments: message.attachments,
      }
      // A job still waiting on a card has no assistant message yet: show it under its question.
      return own && !rows.some((row) => row.id === own.assistantMessageId)
        ? [user, replay(own)]
        : [user]
    }
    const stored = turns.find(
      (turn) => turn.assistantMessageId === message.id && !shown.has(turn.jobId),
    )
    return [stored ? replay(stored) : { kind: 'reply', key: message.id, text: message.text }]
  })
  if (!live) return items
  return [
    ...items,
    ...(live.text
      ? [
          {
            kind: 'user' as const,
            key: 'live-user',
            text: live.text,
            attachments: live.attachments,
          },
        ]
      : []),
    ...(live.turn
      ? [{ kind: 'turn' as const, key: 'live-turn', turn: live.turn, picked: {}, live: true }]
      : []),
  ]
}
