import { josa } from 'es-hangul'
import type { LegalBlock, LegalDocument, LegalSurface } from './types'

// The only wording that differs by surface. The source writes {agent}, never the word.
const TERMS: Record<string, Record<LegalSurface, string>> = {
  agent: { web: '에이전트', app: '봇' },
  // 봇 names the product in the app, so the forbidden tool takes another word there.
  automation: { web: '봇', app: '매크로' },
}

const PARTICLES = ['이/가', '을/를', '은/는', '와/과', '으로/로', '이란/란'] as const

const isParticle = (key: string): key is (typeof PARTICLES)[number] => (PARTICLES as readonly string[]).includes(key)

const renderText = (source: string, surface: LegalSurface) => {
  let word = ''
  return source.replace(/\{([^{}]*)\}/g, (_, key: string) => {
    const term = TERMS[key]?.[surface]
    if (term) {
      word = term
      return term
    }
    // A particle takes its form from the term before it, as in "{agent}"{이란/란}.
    if (word && isParticle(key)) return josa.pick(word, key)
    throw new Error(`Unknown legal placeholder {${key}}`)
  })
}

export const renderLegal = (document: LegalDocument, surface: LegalSurface): LegalDocument => {
  const text = (source: string) => renderText(source, surface)
  const block = (source: LegalBlock): LegalBlock => {
    if (source.kind === 'paragraph') return { ...source, text: text(source.text) }
    if (source.kind === 'list') return { ...source, items: source.items.map(text) }
    return { ...source, columns: source.columns.map(text), rows: source.rows.map((row) => row.map(text)) }
  }
  return {
    ...document,
    title: text(document.title),
    intro: document.intro.map(block),
    articles: document.articles.map((article) => ({ heading: text(article.heading), blocks: article.blocks.map(block) })),
  }
}
