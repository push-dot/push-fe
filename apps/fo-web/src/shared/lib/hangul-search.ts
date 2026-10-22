import { convertQwertyToHangul, disassemble, getChoseong } from 'es-hangul'

export type MatchKind = 'exact' | 'prefix' | 'contains' | 'choseong' | 'jamo' | 'qwerty'
export type Match = { kind: MatchKind; rank: number; start: number; end: number }

const CHOSEONG_ONLY = /^[ㄱ-ㅎ]+$/
const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, '')

const offset = (chars: string[], count: number) => chars.slice(0, count).join('').length

const findBy = (text: string, needle: string, project: (value: string) => string) => {
  const chars = Array.from(text)
  for (let start = 0; start < chars.length; start += 1) {
    if (chars[start] === ' ') continue
    let acc = ''
    for (let end = start; end < chars.length; end += 1) {
      acc += project(chars[end] ?? '')
      if (acc.startsWith(needle)) return { start: offset(chars, start), end: offset(chars, end + 1) }
      if (!needle.startsWith(acc)) break
    }
  }
  return null
}

export const matchHangul = (text: string, rawQuery: string): Match | null => {
  const query = normalize(rawQuery)
  if (!query) return null
  const plain = text.toLowerCase()
  const compact = normalize(text)
  if (compact === query) return { kind: 'exact', rank: 0, start: 0, end: text.length }
  const at = plain.indexOf(rawQuery.trim().toLowerCase())
  if (at === 0) return { kind: 'prefix', rank: 1, start: 0, end: rawQuery.trim().length }
  if (at > 0) return { kind: 'contains', rank: 2, start: at, end: at + rawQuery.trim().length }
  if (CHOSEONG_ONLY.test(query)) {
    const hit = findBy(text, query, (value) => getChoseong(value))
    if (hit) return { kind: 'choseong', rank: 3, ...hit }
  }
  const hit = findBy(text, disassemble(query), (value) => disassemble(value))
  if (hit) return { kind: 'jamo', rank: 4, ...hit }
  if (/^[a-z]+$/.test(query)) {
    const converted = convertQwertyToHangul(query)
    if (converted && converted !== query) {
      const inner = matchHangul(text, converted)
      if (inner) return { ...inner, kind: 'qwerty', rank: 5 }
    }
  }
  return null
}

export const searchHangul = <T,>(items: T[], query: string, fields: (item: T) => string[]) => {
  if (!query.trim()) return items.map((item) => ({ item, match: null as Match | null }))
  const out: { item: T; match: Match; index: number }[] = []
  items.forEach((item, index) => {
    let best: Match | null = null
    for (const field of fields(item)) {
      const match = matchHangul(field, query)
      if (match && (!best || match.rank < best.rank)) best = match
    }
    if (best) out.push({ item, match: best, index })
  })
  return out
    .sort((a, b) => a.match.rank - b.match.rank || a.index - b.index)
    .map(({ item, match }) => ({ item, match }))
}
