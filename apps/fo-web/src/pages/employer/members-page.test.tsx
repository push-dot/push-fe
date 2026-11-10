import type { Company, CompanyInvite, CompanyMember, Session } from '@push/api-client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'

import { sessionStore } from '../../shared/auth/session'
import MembersPage from './members-page'
import { INVITE_RESEND, INVITE_REVOKE } from './constants'

const company = (role: Company['role']): Company => ({
  id: 'co-1',
  bNo: '2148703921',
  name: '모아페이',
  plan: 'PRO',
  verifiedAt: '2026-09-01T00:00:00.000Z',
  role,
  seats: { used: 2, limit: 2 },
})

const members = (): CompanyMember[] => [
  {
    userId: 'u-admin',
    email: 'mina.lee@moapay.kr',
    displayName: '이민아',
    role: 'ADMIN',
    joinedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    userId: 'u-member',
    email: 'jiho.han@moapay.kr',
    displayName: '한지호',
    role: 'MEMBER',
    joinedAt: '2026-09-02T00:00:00.000Z',
  },
]

const invite = (): CompanyInvite => ({
  id: 'inv-1',
  email: 'nuri.choi@moapay.kr',
  invitedAt: '2026-11-03T00:00:00.000Z',
  expiresAt: '2099-01-01T00:00:00.000Z',
})

const session = (role: Session['user']['companyRole']): Session => ({
  accessToken: 'token',
  refreshToken: 'refresh',
  expiresIn: 900,
  user: {
    id: role === 'ADMIN' ? 'u-admin' : 'u-member',
    displayName: '한지호',
    locale: 'ko',
    accountType: 'EMPLOYER',
    companyId: 'co-1',
    companyRole: role,
  },
})

const html = (role: Company['role']) => {
  sessionStore.save(session(role))
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  client.setQueryData(['company', 'me'], company(role))
  client.setQueryData(['company', 'members'], members())
  client.setQueryData(['company', 'invites'], [invite()])
  return renderToStaticMarkup(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <MembersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('members page invites', () => {
  afterEach(() => sessionStore.clear())

  it('lets a member see a pending invite and hides resend and cancel', () => {
    const markup = html('MEMBER')
    expect(markup).toContain('nuri.choi@moapay.kr')
    expect(markup).toContain('대기 중')
    expect(markup).not.toContain(INVITE_RESEND)
    expect(markup).not.toContain('aria-label="더 보기"')
    expect(markup).not.toContain(INVITE_REVOKE)
  })

  it('keeps resend and the cancel menu for an admin', () => {
    const markup = html('ADMIN')
    expect(markup).toContain('nuri.choi@moapay.kr')
    expect(markup).toContain(INVITE_RESEND)
    expect(markup).toContain('aria-label="더 보기"')
  })
})
