import { parsePostingDraft, type PostingDraft } from '../../shared/model/employer-chat'

export type Question = { n: string; text: string; check?: string }

export type AnswerPart = { kind: 'para'; text: string } | { kind: 'questions'; items: Question[] } | { kind: 'draft'; draft: PostingDraft }

const FENCE = /```posting-draft[ \t]*\r?\n[\s\S]*?```/
const NUMBERED = /^(\d+)\.\s+([\s\S]*)$/
const CHECK = /^확인할 점\s*·\s*/

const question = (block: string): Question | null => {
  const match = block.match(NUMBERED)
  if (!match) return null
  const [first = '', ...rest] = (match[2] ?? '').split('\n')
  const check = rest.find((line) => CHECK.test(line))?.replace(CHECK, '').trim()
  return { n: match[1] ?? '', text: first.trim(), ...(check ? { check } : {}) }
}

const textParts = (text: string): AnswerPart[] =>
  text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .reduce<AnswerPart[]>((parts, block) => {
      const item = question(block)
      const last = parts.at(-1)
      if (!item) return [...parts, { kind: 'para', text: block }]
      if (last?.kind === 'questions') return [...parts.slice(0, -1), { kind: 'questions', items: [...last.items, item] }]
      return [...parts, { kind: 'questions', items: [item] }]
    }, [])

export const answerParts = (text: string): AnswerPart[] => {
  const fence = text.match(FENCE)
  const draft = fence ? parsePostingDraft(fence[0]) : null
  if (!fence || !draft) return textParts(text.replace(FENCE, ''))
  const at = fence.index ?? 0
  return [...textParts(text.slice(0, at)), { kind: 'draft', draft }, ...textParts(text.slice(at + fence[0].length))]
}

export const questionsText = (items: Question[]) =>
  items.map((item) => [`${item.n}. ${item.text}`, item.check ? `확인할 점 · ${item.check}` : ''].filter(Boolean).join('\n')).join('\n\n')
