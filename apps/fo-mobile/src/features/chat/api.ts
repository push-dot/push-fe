import { type Conversation, type DataEnvelope, type ListEnvelope } from '@push/api-client'
import { http } from '../../lib/api'
import type { Step } from './types'

/** Conversation plus the list badges (확인 필요 / 작업 중) and last progress line the design needs. */
export type ConversationRow = Conversation & { status?: 'NEEDS_APPROVAL' | 'RUNNING' | null; lastLine?: string }

export type ChatDoc = { id: string; fileName: string; size: number; createdAt: string; aiMade?: boolean }

export type Account = {
  email: string
  plan: 'FREE' | 'PRO' | 'ULTRA'
  credits: { used: number; total: number }
}

export type QsItem = {
  id: string
  title: string
  /** Line above the title (company) */
  over?: string
  sub?: string
  logo?: { text: string; color: string }
  avatar?: { text: string; color: string }
  badge?: { label: string; tone: 'ac' | 'grey' | 'red' | 'green' | 'orange' }
  note?: { label: string; ac?: boolean }
  meta?: string
  /** Message preview under the person line (제안 답장). */
  body?: string
  date?: { dow: string; day: string; color: 'red' | 'orange' | 'green' }
  /** Which segment tab the item belongs to (0 = first). */
  seg?: number
  selected?: boolean
}

/** Ingredients for one quick-start sheet; copy and layout live in quickStarts.ts. */
export type QsData = {
  segments?: string[]
  items: QsItem[]
  doc?: string
  chips?: string[]
  calendar?: { connected: boolean }
}

export type RunInput = {
  conversationId: string
  text?: string
  answer?: { approvalId: string; choice: number }
  interrupted?: boolean
}

// shortcut: endpoints @push/api-client lacks go through the shared client directly; move them into
// @push/api-client once push-be ships them.
const c = http

const data = async <T>(p: Promise<DataEnvelope<T>>) => (await p).data

export const chatApi = {
  conversations: (q: { limit?: number } = {}) => c.get<ListEnvelope<ConversationRow>>('conversations', { query: q }),
  /** Mock-only: the scripted agent run for one message or approval answer. */
  run: (body: RunInput) => data(c.post<DataEnvelope<Step[]>>('chat/runs', { body })),
  docs: () => data(c.get<DataEnvelope<ChatDoc[]>>('chat/docs')),
  // shortcut: records name/size only; switch to api.sources.upload once 내 서류 lists sources.
  addDoc: (body: { fileName: string; size: number }) => data(c.post<DataEnvelope<ChatDoc>>('chat/docs', { body })),
  checkout: (planId: 'PRO' | 'ULTRA') => data(c.post<DataEnvelope<{ url: string }>>('billing/checkout', { body: { planId } })),
  account: () => data(c.get<DataEnvelope<Account>>('chat/account')),
  quickStart: (key: string) => data(c.get<DataEnvelope<QsData>>(`chat/quick-starts/${key}`)),
}
