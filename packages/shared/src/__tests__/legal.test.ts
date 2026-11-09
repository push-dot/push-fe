import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS, legalDocuments, legalMarkdown, type LegalDocument, type LegalOperator } from '../index'

const BUSINESS: LegalOperator = {
  kind: 'business',
  tradeName: '푸시랩',
  representative: '홍길동',
  businessNumber: '123-45-67890',
  mailOrderNumber: '2027-서울강남-0001',
  address: '서울특별시 강남구 테헤란로 1',
  phone: '02-0000-0000',
  contactEmail: 'support@push.devcyjoon.tech',
  privacyOfficer: '홍길동 (대표)',
}

const text = (document: LegalDocument) => legalMarkdown(document)

describe('legal documents', () => {
  it.each(Object.values(LEGAL_DOCUMENTS))('$key matches the published markdown', async (document) => {
    await expect(legalMarkdown(document)).toMatchFileSnapshot(`../legal/md/${document.key}.md`)
  })

  it('calls the operator 운영자 and never 회사', () => {
    for (const document of Object.values(LEGAL_DOCUMENTS)) expect(text(document)).not.toMatch(/"회사"|회사(는|가|의) /)
  })

  it('shows unfilled individual fields as bracketed labels', () => {
    const terms = text(LEGAL_DOCUMENTS.termsOfService)
    expect(terms).toContain('| 운영자 구분 | 개인 |')
    expect(terms).toContain('| 성명 | [성명] |')
    expect(terms).toContain('support@push.devcyjoon.tech')
    expect(terms).not.toContain('사업자등록번호 |')
  })

  it('renders a registered business without placeholders or the individual notice', () => {
    const business = legalDocuments(BUSINESS)
    const terms = text(business.termsOfService)
    for (const value of ['푸시랩', '홍길동', '123-45-67890', '2027-서울강남-0001', '서울특별시 강남구 테헤란로 1', '02-0000-0000']) expect(terms).toContain(value)
    expect(terms).not.toContain('사업자 등록을 하지 않은 개인')
    expect(terms).not.toMatch(/\[(성명|상호|대표자|사업자등록번호|통신판매업 신고번호|주소|전화번호|이메일)\]/)
    expect(text(business.privacyPolicy)).toContain('| 개인정보 보호책임자 | 홍길동 (대표) |')
  })

  it('keeps the designed article headings in order', () => {
    const headings = (document: LegalDocument) => document.articles.map((article) => article.heading)
    const inOrder = (all: string[], wanted: string[]) => wanted.map((heading) => all.indexOf(heading))
    const terms = inOrder(headings(LEGAL_DOCUMENTS.termsOfService), ['제1조 (목적)', '제2조 (정의)', '제3조 (약관의 효력과 변경)', '제8조 (서비스 이용)', '제16조 (이용자의 의무)', '제25조 (책임의 제한)'])
    const privacy = inOrder(
      headings(LEGAL_DOCUMENTS.privacyPolicy).map((heading) => heading.replace(/^\d+\. /, '')),
      ['수집하는 개인정보', '이용 목적', '보관 기간과 파기', '제3자 제공과 처리 위탁', '이용자의 권리', '문의처'],
    )
    for (const order of [terms, privacy]) {
      expect(order.every((index) => index >= 0)).toBe(true)
      expect([...order].sort((a, b) => a - b)).toEqual(order)
    }
  })

  it('numbers articles without gaps', () => {
    const numbers = LEGAL_DOCUMENTS.termsOfService.articles.flatMap((article) => article.heading.match(/^제(\d+)조/)?.[1] ?? []).map(Number)
    expect(numbers).toEqual(numbers.map((_, index) => index + 1))
    const sections = LEGAL_DOCUMENTS.privacyPolicy.articles.map((article) => Number(article.heading.split('.')[0]))
    expect(sections).toEqual(sections.map((_, index) => index + 1))
  })

  it('keeps every table row as wide as its header', () => {
    for (const document of Object.values(LEGAL_DOCUMENTS))
      for (const block of document.articles.flatMap((article) => article.blocks))
        if (block.kind === 'table') for (const row of block.rows) expect(row).toHaveLength(block.columns.length)
  })
})
