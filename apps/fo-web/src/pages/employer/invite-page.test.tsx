// @vitest-environment happy-dom
import { ApiError } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import InvitePage from './invite-page'
import { INVITE_FACT_EXPIRES, INVITE_FACT_INVITER, ledgerDate } from './constants'

const expiresAt = '2026-11-08T00:00:00.000Z'

vi.mock('../../features/accept-invite', () => ({
  companiesInvitePreview: vi.fn(async () => {
    throw new ApiError('초대가 만료됐어요', 'NOT_FOUND', 404, {
      reason: 'EXPIRED',
      companyName: '모아페이',
      inviterName: '이민아',
      expiresAt,
    })
  }),
  companiesAcceptInvite: vi.fn(),
}))

describe('expired invite', () => {
  let root: Root | undefined
  let container: HTMLDivElement | undefined

  afterEach(() => {
    act(() => root?.unmount())
    container?.remove()
  })

  it('shows who sent it and when it expired', async () => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    act(() => {
      root?.render(
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/invites/expired-token']}>
            <Routes>
              <Route path="/invites/:token" element={<InvitePage />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>,
      )
    })
    let html = ''
    for (let attempt = 0; attempt < 20 && !html.includes('이민아'); attempt += 1) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0))
      })
      html = container.innerHTML
    }
    expect(html).toContain('모아페이')
    expect(html).toContain(INVITE_FACT_INVITER)
    expect(html).toContain('이민아')
    expect(html).toContain(INVITE_FACT_EXPIRES)
    expect(html).toContain(ledgerDate(expiresAt))
  })
})
