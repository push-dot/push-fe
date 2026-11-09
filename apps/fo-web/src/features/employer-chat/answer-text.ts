import { parsePostingDraft, type PostingDraft } from '../../shared/model/employer-chat'

/** `note` holds the lines under the numbered line that are neither a 확인할 점 nor another number. */
export type Question = { n: string; text: string; note?: string; check?: string }

export type AnswerPart =
  | { kind: 'para'; text: string }
  | { kind: 'questions'; items: Question[]; raw: string[] }
  | { kind: 'draft'; draft: PostingDraft }

const FENCE = /```posting-draft[ \t]*\r?\n[\s\S]*?```/
// One or two digits: a paragraph that opens with a date ("2026. 11. 10.") is not a numbered list.
const NUMBERED = /^(\d{1,2})\.\s+(?!\d{1,2}\.)([\s\S]*)$/
const CHECK = /^확인할 점\s*·\s*/

const question = (lines: string[]): Question => {
  const [first = '', ...rest] = lines
  const match = first.match(NUMBERED)
  const checks = rest.filter((line) => CHECK.test(line)).map((line) => line.replace(CHECK, '').trim())
  const note = rest
    .filter((line) => !CHECK.test(line))
    .join('\n')
    .trim()
  return {
    n: match?.[1] ?? '',
    text: (match?.[2] ?? first).trim(),
    ...(note ? { note } : {}),
    ...(checks.length ? { check: checks.join('\n') } : {}),
  }
}

// "1. a\n2. b" is one block with several items: each numbered line starts a question, the lines under it belong to it.
const questions = (block: string): Question[] | null => {
  const lines = block.split('\n')
  if (!NUMBERED.test(lines[0] ?? '')) return null
  return lines
    .reduce<string[][]>(
      (groups, line) =>
        NUMBERED.test(line)
          ? [...groups, [line]]
          : [...groups.slice(0, -1), [...(groups.at(-1) ?? []), line]],
      [],
    )
    .map(question)
}

const textParts = (text: string): AnswerPart[] => {
  const parts = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .reduce<AnswerPart[]>((parts, block) => {
      const items = questions(block)
      const last = parts.at(-1)
      if (!items) return [...parts, { kind: 'para', text: block }]
      if (last?.kind === 'questions')
        return [
          ...parts.slice(0, -1),
          { kind: 'questions', items: [...last.items, ...items], raw: [...last.raw, block] },
        ]
      return [...parts, { kind: 'questions', items, raw: [block] }]
    }, [])
  // A numbered list with no 확인할 점 is an ordinary list (a choice the agent wrote out), not a question card.
  return parts.map((part) =>
    part.kind === 'questions' && !part.items.some((item) => item.check)
      ? { kind: 'para', text: part.raw.join('\n\n') }
      : part,
  )
}

export const answerParts = (text: string): AnswerPart[] => {
  const fence = text.match(FENCE)
  const draft = fence ? parsePostingDraft(fence[0]) : null
  if (!fence || !draft) return textParts(text.replace(FENCE, ''))
  const at = fence.index ?? 0
  return [
    ...textParts(text.slice(0, at)),
    { kind: 'draft', draft },
    ...textParts(text.slice(at + fence[0].length)),
  ]
}

export const questionsText = (items: Question[]) =>
  items
    .map((item) =>
      [`${item.n}. ${item.text}`, item.note ?? '', item.check ? `확인할 점 · ${item.check}` : '']
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n')
