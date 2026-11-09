import { marketingConsent, privacyConsent } from './consents'
import { LEGAL_OPERATOR, koreanDate } from './operator'
import { privacyPolicy } from './privacy-policy'
import { termsOfService } from './terms-of-service'
import type { LegalBlock, LegalDocument, LegalDocumentKey, LegalOperator } from './types'

export const legalDocuments = (operator: LegalOperator): Record<LegalDocumentKey, LegalDocument> => ({
  termsOfService: termsOfService(operator),
  privacyPolicy: privacyPolicy(operator),
  privacyConsent,
  marketingConsent,
})

export const LEGAL_DOCUMENTS = legalDocuments(LEGAL_OPERATOR)

export const legalEffectiveLabel = (document: LegalDocument) => `시행일 ${koreanDate(document.effectiveDate)} · 버전 ${document.version}`

const cell = (text: string) => text.replaceAll('|', '\\|')

const blockMarkdown = (block: LegalBlock) => {
  if (block.kind === 'paragraph') return block.text
  if (block.kind === 'list') return block.items.map((item, index) => `${block.ordered ? `${index + 1}.` : '-'} ${item}`).join('\n')
  const row = (cells: readonly string[]) => `| ${cells.map(cell).join(' | ')} |`
  return [row(block.columns), row(block.columns.map(() => '---')), ...block.rows.map(row)].join('\n')
}

export const legalMarkdown = (document: LegalDocument) =>
  [
    `# ${document.title}`,
    legalEffectiveLabel(document),
    ...document.intro.map(blockMarkdown),
    ...document.articles.flatMap((article) => [`## ${article.heading}`, ...article.blocks.map(blockMarkdown)]),
  ].join('\n\n') + '\n'
