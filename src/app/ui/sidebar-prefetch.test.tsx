import { QueryClientProvider } from '@tanstack/react-query'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { queryClient } from '@/shared/api'

vi.mock('@/features/documents/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/documents/api/fetchers')>()
  return { ...mod, listDocuments: vi.fn() }
})
vi.mock('@/features/applications/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/applications/api/fetchers')>()
  return { ...mod, listApplications: vi.fn() }
})
vi.mock('@/features/evidence/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/evidence/api/fetchers')>()
  return { ...mod, listCareerEvidence: vi.fn() }
})
vi.mock('@/features/interviews/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/interviews/api/fetchers')>()
  return { ...mod, listInterviews: vi.fn() }
})
vi.mock('@/features/calendar/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/calendar/api/fetchers')>()
  return { ...mod, listCalendarEvents: vi.fn() }
})
vi.mock('@/features/chat/api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/features/chat/api/fetchers')>()
  return {
    ...mod,
    listConversations: vi.fn(),
    listMessages: vi.fn(),
    streamActive: vi.fn(),
  }
})

import { listDocuments } from '@/features/documents/api/fetchers'
import { listApplications } from '@/features/applications/api/fetchers'
import { listCareerEvidence } from '@/features/evidence/api/fetchers'
import { listInterviews } from '@/features/interviews/api/fetchers'
import { listCalendarEvents } from '@/features/calendar/api/fetchers'
import { listConversations, listMessages, streamActive } from '@/features/chat/api/fetchers'
import { prefetchDocuments, useDocuments } from '@/features/documents/api/hooks'
import { prefetchApplications, useApplications } from '@/features/applications/api/hooks'
import { prefetchCareerEvidence, useCareerEvidence } from '@/features/evidence/api/hooks'
import { prefetchInterviews, useInterviews } from '@/features/interviews/api/hooks'
import { prefetchCalendarEvents, useCalendarEvents } from '@/features/calendar/api/hooks'
import { prefetchMessages } from '@/features/chat/api/hooks'
import { useMessagesStore } from '@/features/chat/stores'
import Sidebar from './sidebar'

const emptyPage = { nextCursor: null, hasMore: false }

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const LIST_CASES = [
  {
    name: 'documents',
    prefetch: prefetchDocuments,
    useList: useDocuments,
    fetcher: () => vi.mocked(listDocuments),
    key: ['documents'] as const,
  },
  {
    name: 'applications',
    prefetch: prefetchApplications,
    useList: useApplications,
    fetcher: () => vi.mocked(listApplications),
    key: ['applications'] as const,
  },
  {
    name: 'evidence',
    prefetch: prefetchCareerEvidence,
    useList: useCareerEvidence,
    fetcher: () => vi.mocked(listCareerEvidence),
    key: ['career-evidence'] as const,
  },
  {
    name: 'interviews',
    prefetch: prefetchInterviews,
    useList: useInterviews,
    fetcher: () => vi.mocked(listInterviews),
    key: ['interviews'] as const,
  },
  {
    name: 'calendar events',
    prefetch: prefetchCalendarEvents,
    useList: useCalendarEvents,
    fetcher: () => vi.mocked(listCalendarEvents),
    key: ['calendar-events'] as const,
  },
]

describe('route prefetch', () => {
  beforeEach(() => {
    queryClient.clear()
    useMessagesStore.getState().reset()
    vi.mocked(listDocuments).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listApplications).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listCareerEvidence).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listInterviews).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listCalendarEvents).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listConversations).mockReset().mockResolvedValue({ data: [], page: emptyPage })
    vi.mocked(listMessages).mockReset()
    vi.mocked(streamActive).mockReset().mockImplementation(async function* () {} as never)
  })

  it.each(LIST_CASES)(
    '$name prefetch warms the exact cache its list hook reads',
    async ({ prefetch, useList, fetcher, key }) => {
      fetcher().mockResolvedValue({ data: [{ id: 'x1' }], page: emptyPage } as never)
      prefetch()
      await waitFor(() => expect(queryClient.getQueryData(key)).toHaveLength(1))
      const { result, unmount } = renderHook(() => useList(), { wrapper })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      unmount()
      expect(fetcher()).toHaveBeenCalledTimes(1)
    },
  )

  it('dedupes repeated prefetch while data is fresh', async () => {
    prefetchDocuments()
    prefetchDocuments()
    await waitFor(() => expect(queryClient.getQueryData(['documents'])).toBeTruthy())
    expect(listDocuments).toHaveBeenCalledTimes(1)
  })

  it('prefetchMessages warms the store load path for a conversation', async () => {
    vi.mocked(listMessages).mockResolvedValue({
      data: [
        {
          id: 'm1',
          conversationId: 'c1',
          role: 'ASSISTANT',
          text: 'hi',
          attachments: [],
          operationId: null,
          createdAt: '2026-09-01T00:00:00Z',
        },
      ],
      page: emptyPage,
    })
    prefetchMessages('c1')
    await waitFor(() =>
      expect(queryClient.getQueryData(['chat-messages', 'c1'])).toBeTruthy(),
    )
    await useMessagesStore.getState().load('c1')
    expect(listMessages).toHaveBeenCalledTimes(1)
    const s = useMessagesStore.getState()
    expect(s.status).toBe('success')
    expect(s.messages.map((m) => m.id)).toEqual(['m1'])
  })

  it('hovering a nav item prefetches its list and focusing another prefetches too', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    await userEvent.hover(screen.getByRole('button', { name: '내 서류' }))
    await waitFor(() => expect(listDocuments).toHaveBeenCalledTimes(1))
    screen.getByRole('button', { name: '지원 관리' }).focus()
    await waitFor(() => expect(listApplications).toHaveBeenCalledTimes(1))
  })

  it('hovering a conversation item prefetches its messages', async () => {
    vi.mocked(listConversations).mockResolvedValue({
      data: [
        {
          id: 'c1',
          revision: 1,
          title: '첫 대화',
          pinned: false,
          applicationId: null,
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        },
      ],
      page: emptyPage,
    })
    vi.mocked(listMessages).mockResolvedValue({ data: [], page: emptyPage })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </QueryClientProvider>,
    )
    await userEvent.hover(await screen.findByText('첫 대화'))
    await waitFor(() => expect(listMessages).toHaveBeenCalledTimes(1))
  })

  it('measures cold vs warm list resolution time', async () => {
    vi.mocked(listDocuments).mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 60))
      return { data: [{ id: 'd1' }], page: emptyPage } as never
    })
    const coldStart = performance.now()
    const cold = renderHook(() => useDocuments(), { wrapper })
    await waitFor(() => expect(cold.result.current.isSuccess).toBe(true))
    const coldMs = performance.now() - coldStart
    cold.unmount()
    queryClient.clear()

    prefetchDocuments()
    await waitFor(() => expect(queryClient.getQueryData(['documents'])).toBeTruthy())
    const warmStart = performance.now()
    const warm = renderHook(() => useDocuments(), { wrapper })
    await waitFor(() => expect(warm.result.current.isSuccess).toBe(true))
    const warmMs = performance.now() - warmStart
    warm.unmount()

    expect(listDocuments).toHaveBeenCalledTimes(2)
    expect(warmMs).toBeLessThan(coldMs / 2)
    console.info(
      `[prefetch] documents entry cold=${coldMs.toFixed(1)}ms warm=${warmMs.toFixed(1)}ms`,
    )
  })
})
