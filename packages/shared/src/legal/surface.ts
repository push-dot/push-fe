import { josa } from 'es-hangul'
import type { LegalBlock, LegalDocument, LegalOperator, LegalSurface } from './types'

// The only wording that differs by surface. The source writes {agent}, never the word.
const TERMS: Record<string, Record<LegalSurface, string>> = {
  agent: { web: '에이전트', app: 'Bot' },
  plan: { web: '요금제', app: '플랜' },
  // Bot names the product in the app, so the forbidden tool takes another word there.
  automation: { web: '봇', app: '매크로' },
}

// Latin terms are read aloud as Korean, so the particle follows that reading (Bot이, not Bot가).
const READING: Record<string, string> = { Bot: '봇' }

// The app names the operator where the web says only 운영자. Fills {operator} in the sentence that introduces the operator.
const operatorTerm = (operator: LegalOperator, surface: LegalSurface) =>
  surface === 'web' ? '운영자' : `운영자 ${operator.kind === 'individual' ? operator.displayName : operator.tradeName}`

const PARTICLES = ['이/가', '을/를', '은/는', '와/과', '으로/로', '이란/란', '이나/나'] as const

const isParticle = (key: string): key is (typeof PARTICLES)[number] => (PARTICLES as readonly string[]).includes(key)

// A particle placeholder is valid only right after a term, or after the term's closing quote as in "{agent}"{이란/란}.
const renderText = (source: string, surface: LegalSurface, operator: LegalOperator) =>
  source.replace(/\{([^{}]*)\}("?)(?:\{([^{}]*)\})?/g, (placeholder: string, key: string, quote: string, particle?: string) => {
    const term = key === 'operator' ? operatorTerm(operator, surface) : TERMS[key]?.[surface]
    if (!term || (particle !== undefined && !isParticle(particle))) throw new Error(`Unknown legal placeholder ${placeholder}`)
    return term + quote + (particle === undefined ? '' : josa.pick(READING[term] ?? term, particle))
  })

export const renderLegal = (document: LegalDocument, surface: LegalSurface, operator: LegalOperator): LegalDocument => {
  const text = (source: string) => renderText(source, surface, operator)
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
