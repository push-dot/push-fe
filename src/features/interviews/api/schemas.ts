

export type InterviewSession = {
  id: string
  revision: number
  applicationId: string
  title: string
  scheduledAt: string
  durationMinutes: number | null
  eventId: string | null
  evidenceIds: string[]
  notes: string
  reflection: string
  createdAt: string
  updatedAt: string
}
