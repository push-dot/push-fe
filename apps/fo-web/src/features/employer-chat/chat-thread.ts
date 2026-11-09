import type { ConversationTurn, Message } from '@push/api-client'
import { storedTurn, type ChatTurn } from './chat-turn'

export type Attachment = Message['attachments'][number]

/** `text` is empty when the live turn only follows an answer to a card already on screen. */
export type LiveTurn = { text: string; attachments: Attachment[]; turn: ChatTurn | null }

export type ThreadItem =
  | { kind: 'user'; key: string; text: string; attachments: Attachment[] }
  | { kind: 'turn'; key: string; turn: ChatTurn; picked: Record<string, string>; live: boolean }
  | { kind: 'reply'; key: string; text: string }

/**
 * One ordered list for the thread: stored messages, the stored jobs from GET .../turns in place of the assistant
 * messages they produced, and the turn streaming now. The live turn replaces its own user message and the reply that
 * a refetch stores after it, so nothing shows twice.
 */
export const threadItems = (
  messages: Message[],
  turns: ConversationTurn[],
  live: LiveTurn | null,
): ThreadItem[] => {
  const cut = live?.text
    ? messages
        .map((message) => message.role === 'USER' && message.text === live.text)
        .lastIndexOf(true)
    : -1
  const rows = cut >= 0 ? messages.slice(0, cut) : messages
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
