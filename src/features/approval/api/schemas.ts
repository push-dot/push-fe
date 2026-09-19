

export type ApprovalKind =
  'EVIDENCE_USE' | 'DOCUMENT_FINALIZE' | 'APPLICATION_SUBMIT' | 'CLI_EXECUTE'

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'CONSUMED'

export type Approval = {
  id: string
  revision: number
  kind: ApprovalKind
  applicationId: string
  targetId: string
  targetRevision: number | null
  payloadHash: string
  status: ApprovalStatus
  expiresAt: string | null
  decidedAt: string | null
  consumedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ApprovalSummary = {
  approval: Approval
  targetSummary: {
    title?: string
    workingDirectory?: string
    executable?: string
    arguments?: string[]
    prompt?: string
  } | null
}
