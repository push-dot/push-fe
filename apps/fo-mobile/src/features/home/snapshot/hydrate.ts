import type { QueryClient } from '@tanstack/react-query'
import type { SectionKind } from '@/features/jobs'
import type { HomeSnapshot } from './types'

const HOME_KINDS: SectionKind[] = ['latest', 'deadline', 'popular']

export const hydrateHomeQueries = (qc: QueryClient, snapshot: HomeSnapshot) => {
  const { savedAt } = snapshot
  for (const kind of HOME_KINDS) {
    qc.setQueryData(['postings', 'home', kind], snapshot.sections[kind], { updatedAt: savedAt })
  }
  qc.setQueryData(['notifications'], snapshot.notifications, { updatedAt: savedAt })
}

export const collectHomeSnapshotPayload = (qc: QueryClient, savedAt = Date.now()) => {
  const sections = {} as HomeSnapshot['sections']
  for (const kind of HOME_KINDS) {
    const data = qc.getQueryData<HomeSnapshot['sections'][typeof kind]>(['postings', 'home', kind])
    if (!data) return null
    sections[kind] = data
  }
  const notifications = qc.getQueryData<HomeSnapshot['notifications']>(['notifications'])
  if (!notifications) return null
  return { sections, notifications, savedAt } satisfies Omit<HomeSnapshot, 'version'>
}
