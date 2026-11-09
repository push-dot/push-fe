import { parsePostingDraft, type PostingDraft } from '../../shared/model/employer-chat'

/** A run of lines under the numbered line: 확인할 점 lines (`check`) or any other lines, in the order written. */
export type QuestionLine = { check: boolean; text: string }

export type Question = { n: string; text: string; lines: QuestionLine[] }

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
  return {
    n: match?.[1] ?? '',
    text: (match?.[2] ?? first).trim(),
    lines: rest.reduce<QuestionLine[]>((runs, line) => {
      const check = CHECK.test(line)
      const text = check ? line.replace(CHECK, '').trim() : line
      if (!text.trim()) return runs
      const last = runs.at(-1)
      return last?.check === check
        ? [...runs.slice(0, -1), { check, text: `${last.text}\n${text}` }]
        : [...runs, { check, text }]
    }, []),
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
    part.kind === 'questions' && !part.items.some((item) => item.lines.some((line) => line.check))
      ? { kind: 'para', text: part.raw.join('\n\n') }
      : part,
  )
}

export const answerParts = (text: string): AnswerPart[] => {
  const fence = text.match(FENCE)
  const draft = fence ? parsePostingDraft(fence[0]) : null
  // A fence that does not parse stays as written: the member still reads what the agent wrote.
  if (!fence || !draft) return textParts(text)
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
      [
        `${item.n}. ${item.text}`,
        ...item.lines.flatMap((line) =>
          line.check ? line.text.split('\n').map((check) => `확인할 점 · ${check}`) : [line.text],
        ),
      ].join('\n'),
    )
    .join('\n\n')
