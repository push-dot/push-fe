import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PushDocument } from './schemas'

vi.mock('./fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./fetchers')>()
  return {
    ...mod,
    listDocuments: vi.fn(),
    createDocument: vi.fn(),
  }
})

import { createDocument, listDocuments } from './fetchers'
import { useCreateDocument } from './hooks'

const doc = (over: Partial<PushDocument> = {}): PushDocument => ({
  id: 'd1',
  revision: 1,
  applicationId: 'a1',
  title: '이력서',
  kind: 'RESUME',
  template: 'CLASSIC',
  language: 'ko',
  status: 'DRAFT',
  latestVersionId: null,
  finalizedVersionId: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

const body = {
  applicationId: 'a1',
  title: '새 이력서',
  kind: 'RESUME' as const,
  template: 'CLASSIC' as const,
}

let client: QueryClient

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

describe('documents api hooks', () => {
  beforeEach(() => {
    vi.mocked(listDocuments).mockReset()
    vi.mocked(createDocument).mockReset()
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('inserts an optimistic document and replaces it with the server response', async () => {
    client.setQueryData(['documents'], [doc()])
    vi.mocked(listDocuments).mockResolvedValue({
      data: [doc({ id: 'd9' }), doc()],
      page: { nextCursor: null, hasMore: false },
    })
    let resolve!: (d: PushDocument) => void
    vi.mocked(createDocument).mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r
        }),
    )
    const { result } = renderHook(() => useCreateDocument(), { wrapper })
    const pending = result.current.mutateAsync(body)
    await waitFor(() => {
      expect(client.getQueryData<PushDocument[]>(['documents'])?.[0].id).toMatch(/^optimistic-/)
    })
    resolve(doc({ id: 'd9' }))
    await pending
    await waitFor(() => {
      const list = client.getQueryData<PushDocument[]>(['documents']) ?? []
      expect(list.some((d) => d.id.startsWith('optimistic-'))).toBe(false)
      expect(list.map((d) => d.id)).toContain('d9')
    })
  })

  it('rolls back the optimistic document on error', async () => {
    client.setQueryData(['documents'], [doc()])
    vi.mocked(listDocuments).mockResolvedValue({
      data: [doc()],
      page: { nextCursor: null, hasMore: false },
    })
    vi.mocked(createDocument).mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useCreateDocument(), { wrapper })
    await expect(result.current.mutateAsync(body)).rejects.toThrow('boom')
    await waitFor(() => {
      expect(client.getQueryData<PushDocument[]>(['documents'])?.map((d) => d.id)).toEqual(['d1'])
    })
  })
})
