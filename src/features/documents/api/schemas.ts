

export type DocumentKind = 'RESUME' | 'PORTFOLIO' | 'COVER_LETTER'
export type DocumentTemplate = 'CLASSIC' | 'MODERN' | 'COMPACT'
export type DocumentStatus = 'DRAFT' | 'FINALIZED' | 'ARCHIVED'

export type PushDocument = {
  id: string
  revision: number
  applicationId: string
  title: string
  kind: DocumentKind
  template: DocumentTemplate
  language: string | null
  status: DocumentStatus
  latestVersionId: string | null
  finalizedVersionId: string | null
  createdAt: string
  updatedAt: string
}

export type EvidenceRef = {
  evidenceId: string
  start: number
  end: number
}

export type ClaimStatus = 'SUPPORTED' | 'NEEDS_REVIEW' | 'UNSUPPORTED'

export type DocumentBlock = {
  id: string
  text: string
  evidenceRefs: EvidenceRef[]
  claimStatus: ClaimStatus
}

export type DocumentVersion = {
  id: string
  documentId: string
  applicationId: string
  number: number
  content: Record<string, unknown>
  blocks: DocumentBlock[]
  changeNote: string | null
  createdAt: string
}

export type DocumentExport = {
  id: string
  documentId: string
  versionId: string
  format: 'PDF' | 'DOCX'
  template: DocumentTemplate
  language: string | null
  status: 'READY_TO_RENDER'
}
