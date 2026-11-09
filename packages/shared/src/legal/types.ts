export type LegalBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; ordered: boolean; items: readonly string[] }
  | { kind: 'table'; columns: readonly string[]; rows: readonly (readonly string[])[] }

export type LegalArticle = { heading: string; blocks: readonly LegalBlock[] }

export type LegalDocumentKey = 'termsOfService' | 'privacyPolicy' | 'privacyConsent' | 'marketingConsent'

export type LegalDocument = {
  key: LegalDocumentKey
  title: string
  version: string
  effectiveDate: string
  intro: readonly LegalBlock[]
  articles: readonly LegalArticle[]
}

export type LegalOperator =
  | { kind: 'individual'; displayName: string; contactEmail: string; /** Optional: shown only when filled. */ phone?: string }
  | {
      kind: 'business'
      tradeName: string
      representative: string
      businessNumber: string
      mailOrderNumber: string
      address: string
      phone: string
      contactEmail: string
      privacyOfficer: string
    }
