import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Approval, ApprovalSummary } from './api/schemas'

vi.mock('./api/fetchers', async (importOriginal) => {
  const mod = await importOriginal<typeof import('./api/fetchers')>()
  return {
    ...mod,
    getApproval: vi.fn(),
    decideApproval: vi.fn(),
  }
})

vi.mock('@/shared/lib/experiment', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/shared/lib/experiment')>()
  return {
    ...mod,
    useExperimentVariant: vi.fn(),
    useExperimentConversion: vi.fn(),
    trackExperiment: vi.fn(),
  }
})

import { decideApproval, getApproval } from './api/fetchers'
import {
  trackExperiment,
  useExperimentConversion,
  useExperimentVariant,
} from '@/shared/lib/experiment'
import ApprovalSurface from './components/approval-surface'

const approval = (over: Partial<Approval> = {}): Approval => ({
  id: 'ap1',
  revision: 1,
  kind: 'CLI_EXECUTE',
  applicationId: 'app1',
  targetId: 't1',
  targetRevision: 1,
  payloadHash: 'h',
  status: 'PENDING',
  expiresAt: null,
  decidedAt: null,
  consumedAt: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  ...over,
})

const summary = (a: Approval): ApprovalSummary => ({
  approval: a,
  targetSummary: { title: 'run tests', executable: 'make test' },
})

let client: QueryClient
let conversionSpy: ReturnType<typeof vi.fn>

const renderSurface = () =>
  render(
    <QueryClientProvider client={client}>
      <ApprovalSurface approvalId="ap1" />
    </QueryClientProvider>,
  )

describe('approval-surface', () => {
  beforeEach(() => {
    vi.mocked(getApproval).mockReset()
    vi.mocked(decideApproval).mockReset()
    vi.mocked(trackExperiment).mockReset()
    vi.mocked(useExperimentVariant).mockReset()
    conversionSpy = vi.fn()
    vi.mocked(useExperimentConversion).mockReturnValue(conversionSpy as never)
    vi.mocked(getApproval).mockResolvedValue(summary(approval()))
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  })

  it('variant A renders the inline card only', async () => {
    vi.mocked(useExperimentVariant).mockReturnValue('A')
    renderSurface()
    await screen.findByText(/CLI 실행 승인/)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(trackExperiment).toHaveBeenCalledWith('approval-surface', 'exposure', 'ap1')
  })

  it('variant B opens a modal around the card', async () => {
    vi.mocked(useExperimentVariant).mockReturnValue('B')
    renderSurface()
    await screen.findByRole('dialog')
    expect(trackExperiment).toHaveBeenCalledWith('approval-surface', 'exposure', 'ap1')
  })

  it('variant B modal dismisses but keeps the inline card', async () => {
    vi.mocked(useExperimentVariant).mockReturnValue('B')
    renderSurface()
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(dialog.parentElement as Element)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getAllByText(/CLI 실행 승인/).length).toBeGreaterThan(0)
  })

  it('restores focus to the timeline when the modal closes', async () => {
    vi.mocked(useExperimentVariant).mockReturnValue('A')
    const view = renderSurface()
    const deny = await screen.findByRole('button', { name: /거부/ })
    deny.focus()
    vi.mocked(useExperimentVariant).mockReturnValue('B')
    view.rerender(
      <QueryClientProvider client={client}>
        <ApprovalSurface approvalId="ap1" />
      </QueryClientProvider>,
    )
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(dialog.parentElement as Element)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(deny)
  })

  it('tracks conversion when a decision completes', async () => {
    vi.mocked(useExperimentVariant).mockReturnValue('A')
    vi.mocked(decideApproval).mockResolvedValue(approval({ status: 'APPROVED' }))
    render(
      <QueryClientProvider client={client}>
        <ApprovalSurface approvalId="ap1" />
      </QueryClientProvider>,
    )
    const decide = await screen.findByRole('button', { name: /승인/ })
    await userEvent.click(decide)
    await waitFor(() => expect(conversionSpy).toHaveBeenCalled())
  })
})
