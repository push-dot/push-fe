import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...mod,
    getAssignment: vi.fn(),
    trackExperimentEvent: vi.fn(),
  }
})

import { getAssignment, queryClient, trackExperimentEvent } from '@/shared/api'
import {
  experimentVariant,
  resetExperiments,
  trackExperiment,
  useExperimentVariant,
} from './experiment'

const assignment = (variant: string, enrolled = true) => ({
  experimentKey: 'exp',
  variant,
  enrolled,
  createdAt: '2026-09-01T00:00:00Z',
})

let client: QueryClient

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
)

describe('experiment helpers', () => {
  beforeEach(() => {
    vi.mocked(getAssignment).mockReset()
    vi.mocked(trackExperimentEvent).mockReset()
    vi.mocked(trackExperimentEvent).mockResolvedValue(undefined)
    resetExperiments()
    queryClient.clear()
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('experimentVariant returns the assigned variant', async () => {
    vi.mocked(getAssignment).mockResolvedValue(assignment('B'))
    await expect(experimentVariant('exp')).resolves.toBe('B')
  })

  it('experimentVariant falls back when the fetch fails', async () => {
    vi.mocked(getAssignment).mockRejectedValue(new Error('off'))
    await expect(experimentVariant('exp')).resolves.toBe('A')
  })

  it('useExperimentVariant returns the variant without tracking exposure', async () => {
    vi.mocked(getAssignment).mockResolvedValue(assignment('B'))
    const { result } = renderHook(() => useExperimentVariant('exp'), { wrapper })
    await waitFor(() => expect(result.current).toBe('B'))
    expect(trackExperimentEvent).not.toHaveBeenCalled()
  })

  it('trackExperiment dedupes by key, event, and scope', async () => {
    trackExperiment('exp', 'exposure')
    trackExperiment('exp', 'exposure')
    trackExperiment('exp', 'exposure', 'other')
    trackExperiment('exp', 'conversion')
    await waitFor(() => expect(trackExperimentEvent).toHaveBeenCalledTimes(3))
    expect(vi.mocked(trackExperimentEvent).mock.calls.map((c) => c[1])).toEqual([
      'exposure',
      'exposure',
      'conversion',
    ])
  })

  it('resetExperiments clears the dedupe set', async () => {
    trackExperiment('exp', 'exposure')
    resetExperiments()
    trackExperiment('exp', 'exposure')
    await waitFor(() => expect(trackExperimentEvent).toHaveBeenCalledTimes(2))
  })
})
