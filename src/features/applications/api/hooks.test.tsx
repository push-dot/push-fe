import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Application } from './schemas'

vi.mock('./fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./fetchers')>()
  return {
    ...mod,
    listApplications: vi.fn(),
    createApplication: vi.fn(),
    patchApplication: vi.fn(),
  }
})

import { createApplication, listApplications, patchApplication } from './fetchers'
import { useApplications, useMoveStage } from './hooks'

const app = (over: Partial<Application> = {}): Application => ({
  id: 'a1',
  revision: 1,
  jobId: 'j1',
  company: '삼성전자',
  title: '백엔드',
  stage: 'DISCOVERED',
  notes: '',
  appliedAt: null,
  nextActionAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

let client: QueryClient

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

describe('applications api hooks', () => {
  beforeEach(() => {
    vi.mocked(listApplications).mockReset()
    vi.mocked(createApplication).mockReset()
    vi.mocked(patchApplication).mockReset()
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('fetches the application list', async () => {
    vi.mocked(listApplications).mockResolvedValue({
      data: [app()],
      page: { nextCursor: null, hasMore: false },
    })
    const { result } = renderHook(() => useApplications(), { wrapper })
    expect(result.current.isPending).toBe(true)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('moves stage with expectedRevision when transition is legal', async () => {
    client.setQueryData(['applications'], [app({ stage: 'DISCOVERED', revision: 3 })])
    vi.mocked(patchApplication).mockResolvedValue(app({ stage: 'PREPARING', revision: 4 }))
    const { result } = renderHook(() => useMoveStage(), { wrapper })
    await result.current.mutateAsync({ id: 'a1', to: 'PREPARING' })
    expect(patchApplication).toHaveBeenCalledWith('a1', {
      expectedRevision: 3,
      stage: 'PREPARING',
    })
    expect(client.getQueryData<Application[]>(['applications'])?.[0].stage).toBe('PREPARING')
  })

  it('does not call the API on an illegal transition', async () => {
    client.setQueryData(['applications'], [app({ stage: 'ACCEPTED' })])
    const { result } = renderHook(() => useMoveStage(), { wrapper })
    const r = await result.current.mutateAsync({ id: 'a1', to: 'DISCOVERED' })
    expect(r).toBeNull()
    expect(patchApplication).not.toHaveBeenCalled()
  })
})
