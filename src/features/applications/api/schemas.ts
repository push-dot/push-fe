

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
