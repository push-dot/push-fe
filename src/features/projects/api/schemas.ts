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
