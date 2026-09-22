import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JobPosting } from './schemas'

vi.mock('./fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./fetchers')>()
  return {
    ...mod,
    listJobs: vi.fn(),
    createJob: vi.fn(),
  }
})

import { createJob, listJobs } from './fetchers'
import { useCreateJob } from './hooks'

const job = (over: Partial<JobPosting> = {}): JobPosting => ({
  id: 'j1',
  revision: 1,
  company: '삼성전자',
  title: '백엔드',
  sourceKind: 'TEXT',
  sourceUrl: null,
  sourceText: '공고 원문',
  requirements: [],
  preferred: [],
  keywords: [],
  risks: [],
  deadline: null,
  language: 'ko',
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

const body = {
  company: '네이버',
  title: '프론트엔드',
  sourceKind: 'TEXT' as const,
  sourceText: '공고 원문',
}

let client: QueryClient

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

describe('jobs api hooks', () => {
  beforeEach(() => {
    vi.mocked(listJobs).mockReset()
    vi.mocked(createJob).mockReset()
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('inserts an optimistic job and replaces it with the server response', async () => {
    client.setQueryData(['jobs'], [job()])
    vi.mocked(listJobs).mockResolvedValue({
      data: [job({ id: 'j9' }), job()],
      page: { nextCursor: null, hasMore: false },
    })
    let resolve!: (j: JobPosting) => void
    vi.mocked(createJob).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result } = renderHook(() => useCreateJob(), { wrapper })
    const pending = result.current.mutateAsync(body)
    await waitFor(() => {
      expect(client.getQueryData<JobPosting[]>(['jobs'])?.[0].id).toMatch(/^optimistic-/)
    })
    resolve(job({ id: 'j9', company: '네이버' }))
    await pending
    await waitFor(() => {
      const list = client.getQueryData<JobPosting[]>(['jobs']) ?? []
      expect(list.some((j) => j.id.startsWith('optimistic-'))).toBe(false)
      expect(list.map((j) => j.id)).toContain('j9')
    })
  })

  it('rolls back the optimistic job on error', async () => {
    client.setQueryData(['jobs'], [job()])
    vi.mocked(listJobs).mockResolvedValue({
      data: [job()],
      page: { nextCursor: null, hasMore: false },
    })
    vi.mocked(createJob).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useCreateJob(), { wrapper })
    await expect(result.current.mutateAsync(body)).rejects.toThrow('boom')
    await waitFor(() => {
      expect(client.getQueryData<JobPosting[]>(['jobs'])?.map((j) => j.id)).toEqual(['j1'])
    })
  })
})
