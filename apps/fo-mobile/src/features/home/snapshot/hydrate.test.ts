import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import { HOME_SNAPSHOT_VERSION } from './constants'
import { collectHomeSnapshotPayload, hydrateHomeQueries } from './hydrate'
import type { HomeSnapshot } from './types'

const snapshot: HomeSnapshot = {
  version: HOME_SNAPSHOT_VERSION,
  savedAt: 1_700_000_000_000,
  sections: {
    latest: { data: [{ id: 'a' } as never], page: { nextCursor: null, hasMore: false } },
    deadline: { data: [{ id: 'b' } as never], page: { nextCursor: null, hasMore: false } },
    popular: { data: [{ id: 'c' } as never], page: { nextCursor: null, hasMore: false } },
  },
  notifications: { data: [{ id: 'n1', readAt: null } as never], page: { nextCursor: null, hasMore: false } },
}

describe('home snapshot hydrate', () => {
  it('seeds react-query with cached home and notification lists', () => {
    const qc = new QueryClient()
    hydrateHomeQueries(qc, snapshot)
    expect(qc.getQueryState(['postings', 'home', 'latest'])?.dataUpdatedAt).toBe(snapshot.savedAt)
    expect(qc.getQueryData(['postings', 'home', 'popular'])).toEqual(snapshot.sections.popular)
    expect(qc.getQueryData(['notifications'])).toEqual(snapshot.notifications)
  })

  it('collects a snapshot only when every home query has succeeded', () => {
    const qc = new QueryClient()
    expect(collectHomeSnapshotPayload(qc)).toBeNull()
    hydrateHomeQueries(qc, snapshot)
    expect(collectHomeSnapshotPayload(qc, 99)).toMatchObject({ savedAt: 99, sections: snapshot.sections })
  })
})
