import type { Operation } from '@/shared/api'
import type { AccessMode, AiOptions } from '@/features/inference'

export type Conversation = {
  id: string
  revision: number
  applicationId: string | null
  projectId?: string
  title: string
  pinned: boolean
  createdAt: string
  updatedAt: string
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export type MessageAttachment =
  | { type: 'DOCUMENT_VERSION'; id: string; documentId: string; title: string }
  | { type: 'EVIDENCE'; id: string; title: string }
  | { type: 'APPROVAL'; id: string }

export type Message = {
  id: string
  conversationId: string
  role: MessageRole
  text: string
  attachments: MessageAttachment[]
  operationId: string | null
  createdAt: string
}
export type MessageStreamEvent =
  | { type: 'token'; text: string; seq?: number }
  | { type: 'status'; text: string; seq?: number }
  | { type: 'done'; operation: Operation; seq?: number }
  | {
      type: 'error'
      error: { code: string; message: string; details?: Record<string, unknown> }
      seq?: number
    }

export type SendMessageBody = {
  text: string
  context: { documentId?: string; versionId?: string; evidenceIds: string[] }
  ai: AiOptions
  accessMode: AccessMode
}
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
export type CliProvider = 'CODEX' | 'CLAUDE_CODE' | 'GROK_BUILD'

export type CliRunState =
  'DRAFT' | 'APPROVAL_REQUIRED' | 'RUNNING' | 'VERIFYING' | 'VERIFIED' | 'FAILED'

export type CliRun = {
  id: string
  revision: number
  projectId: string
  applicationId: string
  provider: CliProvider
  workingDirectory: string
  executable: string
  arguments: string[]
  prompt: string
  payloadHash: string
  state: CliRunState
  approvalId: string | null
  startedAt: string | null
  finishedAt: string | null
  failureReason: string | null
  createdAt: string
  updatedAt: string
}

export type BlueprintTask = {
  id: string
  title: string
  description: string
  acceptance: string[]
}

export type BlueprintMetric = {
  name: string
  unit: string
  measurement: string
  target: number | null
}

export type ProjectBlueprint = {
  id: string
  revision: number
  applicationId: string
  gapAnalysisId: string
  title: string
  skills: string[]
  problem: string
  solution: string
  tasks: BlueprintTask[]
  completionCriteria: string[]
  metrics: BlueprintMetric[]
  estimatedEffort: { minHours: number; maxHours: number }
  state: 'DRAFT' | 'SELECTED' | 'IN_PROGRESS' | 'VERIFIED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export type ProjectEvidence = {
  id: string
  revision: number
  projectId: string
  runId: string
  commitUrl: string
  commitSha: string
  testResults: string
  metrics: { name: string; value: number; unit: string }[]
  summary: string
  status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verificationMethod: string | null
  verifiedAt: string | null
  careerEvidenceId: string | null
}
