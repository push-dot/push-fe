export type ApplicationStage =
  | 'DISCOVERED'
  | 'PREPARING'
  | 'READY'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type Application = {
  id: string
  revision: number
  jobId: string
  company: string
  title: string
  stage: ApplicationStage
  notes: string
  appliedAt: string | null
  nextActionAt: string | null
  createdAt: string
  updatedAt: string
}
export type JobPosting = {
  id: string
  revision: number
  company: string
  title: string
  sourceKind: 'URL' | 'TEXT' | 'DOM'
  sourceUrl: string | null
  sourceText: string
  requirements: string[]
  preferred: string[]
  keywords: string[]
  risks: string[]
  deadline: string | null
  language: string | null
  createdAt: string
  updatedAt: string
}

export type GapAnalysis = {
  id: string
  applicationId: string
  jobId: string
  jobRevision: number
  evidenceIds: string[]
  matched: { requirement: string; evidenceIds: string[] }[]
  missing: string[]
  preferredMissing: string[]
  risks: string[]
  fitScore: number | null
  method: 'RULE_BASED' | 'AI_ASSISTED'
  createdAt: string
}
