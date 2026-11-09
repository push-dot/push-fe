import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { LEGAL_DOCUMENTS, LEGAL_VERSION, legalEffectiveLabel } from '@push/shared'
import { describe, expect, it } from 'vitest'
import type { LegalKind } from './constants'
import LegalPage from './legal-page'

const html = (kind: LegalKind) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <LegalPage kind={kind} />
    </MemoryRouter>,
  )

const CASES = [
  { kind: 'terms', doc: LEGAL_DOCUMENTS.termsOfService },
  { kind: 'privacy', doc: LEGAL_DOCUMENTS.privacyPolicy },
  { kind: 'privacyConsent', doc: LEGAL_DOCUMENTS.privacyConsent },
  { kind: 'marketingConsent', doc: LEGAL_DOCUMENTS.marketingConsent },
] as const

const esc = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')

describe.each(CASES)('LegalPage $kind', ({ kind, doc }) => {
  const markup = html(kind)

  it('shows the same document the app shows, not a placeholder', () => {
    expect(markup).not.toMatch(/\[조문 내용\]|\[자리 표시\]|원문이 확정되면/)
    expect(markup).toContain(esc(doc.title))
    expect(markup).toContain(legalEffectiveLabel(doc))
    expect(doc.version).toBe(LEGAL_VERSION)
  })

  it('lists every article heading of the shared document in order', () => {
    const headings = [...markup.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map((match) => match[1])
    expect(headings).toEqual(doc.articles.map((article) => esc(article.heading)))
  })

  const blocks = doc.articles.flatMap((article) => article.blocks).concat(doc.intro)

  it('renders every paragraph and every list item of the shared document', () => {
    for (const block of blocks) {
      if (block.kind === 'paragraph') expect(markup).toContain(`>${esc(block.text)}</p>`)
      if (block.kind === 'list') {
        const tag = block.ordered ? 'ol' : 'ul'
        const items = block.items.map((item) => `<li>${esc(item)}</li>`).join('')
        expect(markup).toContain(`>${items}</${tag}>`)
      }
    }
  })

  it('renders every table as a real table with column headers and a focusable named scroll region', () => {
    const tables = blocks.filter((block) => block.kind === 'table')
    expect(markup.match(/<table/g)?.length ?? 0).toBe(tables.length)
    const headers = tables.reduce((sum, table) => sum + table.columns.length, 0)
    expect(markup.match(/<th scope="col">/g)?.length ?? 0).toBe(headers)
    const names = [
      ...markup.matchAll(
        /<div class="biz-table-wrap" role="region" aria-label="([^"]+ 표( \d+)?)" tabindex="0">/g,
      ),
    ].map((match) => match[1])
    expect(names).toHaveLength(tables.length)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('LegalPage operator facts', () => {
  it('names the privacy officer and the support mailbox', () => {
    const markup = html('privacy')
    expect(markup).toContain('채영준')
    expect(markup).toContain('support@push.devcyjoon.tech')
  })
})
