import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS, LEGAL_OPERATOR, legalDocuments, legalMarkdown, type LegalDocument, type LegalDocumentKey, type LegalOperator } from '../index'

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

const APP_DOCUMENTS = legalDocuments(LEGAL_OPERATOR, 'app')
const SURFACES = [LEGAL_DOCUMENTS, APP_DOCUMENTS]

const APP_FORM: Record<string, string> = {
  '"에이전트"란': '"봇"이란',
  에이전트가: '봇이',
  에이전트를: '봇을',
  에이전트는: '봇은',
  에이전트와: '봇과',
  에이전트로: '봇으로',
  에이전트: '봇',
}

const appWording = (web: string) =>
  web.replace('크롤러, 봇, 스크립트', '크롤러, 매크로, 스크립트').replace(/"에이전트"란|에이전트[가를는와로]?/g, (form) => APP_FORM[form])

describe('legal documents', () => {
  it.each(Object.values(LEGAL_DOCUMENTS))('$key matches the published markdown', async (document) => {
    await expect(legalMarkdown(document)).toMatchFileSnapshot(`../legal/md/${document.key}.md`)
  })

  it.each(Object.values(APP_DOCUMENTS))('$key matches the published app markdown', async (document) => {
    await expect(legalMarkdown(document)).toMatchFileSnapshot(`../legal/md/app/${document.key}.md`)
  })

  it('renders the web text when no surface is named', () => {
    expect(legalDocuments(LEGAL_OPERATOR)).toEqual(LEGAL_DOCUMENTS)
    expect(legalDocuments(LEGAL_OPERATOR, 'web')).toEqual(LEGAL_DOCUMENTS)
  })

  it('says 봇 in the app with the particle 봇 takes, and never 에이전트', () => {
    for (const document of Object.values(APP_DOCUMENTS)) {
      expect(text(document)).not.toContain('에이전트')
      expect(text(document)).not.toMatch(/봇(가|를|는|와|로)/)
    }
    const terms = text(APP_DOCUMENTS.termsOfService)
    for (const form of ['"봇"이란', '봇이', '봇을', '봇은', '봇과', '봇으로', '제9조 (봇(AI) 이용)']) expect(terms).toContain(form)
  })

  it('says 봇 on the web only for the forbidden tool, which takes another word in the app', () => {
    for (const document of Object.values(LEGAL_DOCUMENTS)) expect(text(document).replace('크롤러, 봇, 스크립트 같은 자동화된 수단', '')).not.toContain('봇')
    expect(text(LEGAL_DOCUMENTS.termsOfService)).toContain('크롤러, 봇, 스크립트 같은 자동화된 수단')
    expect(text(APP_DOCUMENTS.termsOfService)).toContain('크롤러, 매크로, 스크립트 같은 자동화된 수단')
  })

  it('differs between the app and the web only in the surface wording', () => {
    for (const key of Object.keys(LEGAL_DOCUMENTS) as LegalDocumentKey[]) expect(text(APP_DOCUMENTS[key])).toBe(appWording(text(LEGAL_DOCUMENTS[key])))
  })

  it('reads a page the user did not give only after the user allows it, on both surfaces', () => {
    for (const documents of SURFACES)
      expect(text(documents.termsOfService)).toContain('다만 이용자가 주지 않은 페이지는 이용자가 그 페이지나 그 사이트를 읽어도 된다고 허락한 뒤에만 읽으며, 이용자는 거절할 수 있습니다.')
  })

  it('says usage records outlive a deleted chat without its content, on both surfaces', () => {
    expect(text(LEGAL_DOCUMENTS.privacyPolicy)).toContain('에이전트의 사용 기록(쓴 모델, 처리한 분량)도 잔액 계산에 쓰므로, 이용자가 대화를 지운 뒤에도 대화 내용 없이 계정이 있는 동안 보관합니다.')
    expect(text(APP_DOCUMENTS.privacyPolicy)).toContain('봇의 사용 기록(쓴 모델, 처리한 분량)도 잔액 계산에 쓰므로, 이용자가 대화를 지운 뒤에도 대화 내용 없이 계정이 있는 동안 보관합니다.')
  })

  it('calls the operator 운영자 and never 회사', () => {
    for (const document of Object.values(LEGAL_DOCUMENTS)) expect(text(document)).not.toMatch(/"회사"|회사(는|가|의) /)
  })

  it('shows unfilled individual fields as bracketed labels', () => {
    const terms = text(LEGAL_DOCUMENTS.termsOfService)
    expect(terms).toContain('| 운영자 구분 | 개인 |')
    expect(terms).toContain('| 성명 | 채영준 |')
    expect(terms).toContain('support@push.devcyjoon.tech')
    expect(terms).not.toContain('사업자등록번호 |')
  })

  it('shows the privacy officer phone only when the operator fills it', () => {
    const officer = (phone?: string) => text(legalDocuments({ kind: 'individual', displayName: '채영준', contactEmail: 'support@push.devcyjoon.tech', phone }).privacyPolicy)
    expect(officer()).toContain('| 개인정보 보호책임자 | 채영준 (운영자) |')
    expect(officer()).not.toContain('| 전화번호 |')
    expect(officer('010-0000-0000')).toContain('| 전화번호 | 010-0000-0000 |')
  })

  it('renders a registered business without placeholders or the individual notice', () => {
    const business = legalDocuments(BUSINESS)
    const terms = text(business.termsOfService)
    for (const value of ['푸시랩', '홍길동', '123-45-67890', '2027-서울강남-0001', '서울특별시 강남구 테헤란로 1', '02-0000-0000']) expect(terms).toContain(value)
    expect(terms).not.toContain('사업자 등록을 하지 않은 개인')
    expect(terms).not.toMatch(/\[(성명|상호|대표자|사업자등록번호|통신판매업 신고번호|주소|전화번호|이메일)\]/)
    expect(text(business.privacyPolicy)).toContain('| 개인정보 보호책임자 | 홍길동 (대표) |')
    expect(terms).toContain('| 호스팅서비스 제공자 | Cloudflare, Inc., HOSTINGER PTE LTD |')
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

  it('states the document purge and the employer email sign-up items', () => {
    const policy = text(LEGAL_DOCUMENTS.privacyPolicy)
    expect(policy).toContain('| 지운 서류 | 바로 목록·에이전트에서 빼고 30일 뒤 지움 | 이용자의 삭제 요청 |')
    expect(policy).toContain('올린 파일과 서비스에서 만든 서류를 지우고')
    expect(policy).toContain('글과 댓글을 지우는 일처럼')
    const consent = text(LEGAL_DOCUMENTS.privacyConsent)
    expect(consent).toContain('| 기업 이메일 가입 | 이메일 주소, 비밀번호(되돌릴 수 없게 암호화해 저장), 이름, 약관 동의 기록 |')
    expect(policy).not.toMatch(/"회사"|회사(는|가|의) /)
    expect(consent).not.toMatch(/"회사"|회사(는|가|의) /)
  })

  it('ships no unfilled placeholder in the published texts', () => {
    for (const documents of SURFACES) for (const document of Object.values(documents)) expect(text(document)).not.toMatch(/\[[^\]]+\]|[{}]/)
  })

  it('keeps every table row as wide as its header', () => {
    for (const document of Object.values(LEGAL_DOCUMENTS))
      for (const block of document.articles.flatMap((article) => article.blocks))
        if (block.kind === 'table') for (const row of block.rows) expect(row).toHaveLength(block.columns.length)
  })
})
