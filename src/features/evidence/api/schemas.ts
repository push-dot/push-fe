export type EvidenceKind = 'RESUME' | 'GITHUB' | 'CAREER' | 'EDUCATION' | 'SKILL' | 'PROJECT'

export type VerificationStatus = 'USER_PROVIDED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export type CareerEvidence = {
  id: string
  revision: number
  createdAt: string
  updatedAt: string
  kind: EvidenceKind
  title: string
  sourceText: string
  sourceUrl: string | null
  skills: string[]
  verificationStatus: VerificationStatus
  provenance: {
    sourceId: string | null
    projectEvidenceId: string | null
    contentHash: string
    sourceLocation: {
      start: number
      end: number
      unit: 'CODE_POINT'
    } | null
  }
}

export type SourceFile = {
  id: string
  fileName: string
  mimeType: string
  size: number
  sha256: string
  status: string
}
