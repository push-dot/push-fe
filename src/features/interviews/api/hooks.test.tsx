import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InterviewSession } from './schemas'

vi.mock('./fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./fetchers')>()
  return {
    ...mod,
    listInterviews: vi.fn(),
    createInterview: vi.fn(),
  }
})

import { createInterview, listInterviews } from './fetchers'
import { useCreateInterview } from './hooks'

const session = (over: Partial<InterviewSession> = {}): InterviewSession => ({
  id: 'i1',
  revision: 1,
  applicationId: 'a1',
  title: '1차 면접',
  scheduledAt: '2026-09-10T09:00:00Z',
  durationMinutes: 60,
  eventId: null,
  evidenceIds: [],
  notes: '',
  reflection: '',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

const body = {
  applicationId: 'a1',
  title: '2차 면접',
  scheduledAt: '2026-09-20T09:00:00Z',
}

let client: QueryClient

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

describe('interviews api hooks', () => {
  beforeEach(() => {
    vi.mocked(listInterviews).mockReset()
    vi.mocked(createInterview).mockReset()
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('inserts an optimistic session and replaces it with the server response', async () => {
    client.setQueryData(['interviews'], [session()])
    vi.mocked(listInterviews).mockResolvedValue({
      data: [session({ id: 'i9' }), session()],
      page: { nextCursor: null, hasMore: false },
    })
    let resolve!: (s: InterviewSession) => void
    vi.mocked(createInterview).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result } = renderHook(() => useCreateInterview(), { wrapper })
    const pending = result.current.mutateAsync(body)
    await waitFor(() => {
      expect(client.getQueryData<InterviewSession[]>(['interviews'])?.[0].id).toMatch(
        /^optimistic-/,
      )
    })
    resolve(session({ id: 'i9', title: '2차 면접' }))
    await pending
    await waitFor(() => {
      const list = client.getQueryData<InterviewSession[]>(['interviews']) ?? []
      expect(list.some((s) => s.id.startsWith('optimistic-'))).toBe(false)
      expect(list.map((s) => s.id)).toContain('i9')
    })
  })

  it('rolls back the optimistic session on error', async () => {
    client.setQueryData(['interviews'], [session()])
    vi.mocked(listInterviews).mockResolvedValue({
      data: [session()],
      page: { nextCursor: null, hasMore: false },
    })
    vi.mocked(createInterview).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useCreateInterview(), { wrapper })
    await expect(result.current.mutateAsync(body)).rejects.toThrow('boom')
    await waitFor(() => {
      expect(client.getQueryData<InterviewSession[]>(['interviews'])?.map((s) => s.id)).toEqual([
        'i1',
      ])
    })
  })
})
