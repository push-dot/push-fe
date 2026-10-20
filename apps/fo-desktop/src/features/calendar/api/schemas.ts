export type GoogleStatus = {
  enabled: boolean
  connected: boolean
  scopes: string[]
  gmailStatus: string
  calendarStatus: string
  lastSyncedAt: string | null
}

export type CalendarEvent = {
  id: string
  revision: number
  applicationId: string | null
  type: 'INTERVIEW' | 'DEADLINE' | 'FOLLOW_UP' | 'CUSTOM'
  title: string
  startsAt: string
  endsAt: string
  timeZone: string
  source: 'LOCAL' | 'GOOGLE'
  externalId: string | null
  notes: string
  createdAt: string
  updatedAt: string
}
