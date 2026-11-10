import type { AppNotification, ListEnvelope, Posting } from '@push/api-client'
import type { SectionKind } from '@/features/jobs'

export type HomeSnapshotSections = Record<SectionKind, ListEnvelope<Posting>>

export type HomeSnapshot = {
  version: number
  savedAt: number
  sections: HomeSnapshotSections
  notifications: ListEnvelope<AppNotification>
}
