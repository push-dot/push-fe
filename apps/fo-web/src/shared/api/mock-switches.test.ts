import { afterEach, describe, expect, it, vi } from 'vitest'
import { readEvents } from '@push/api-client'
import { MOCK_SWITCHES, mockFetch, setMockPersona, setMockSwitches } from './mock'

const API = 'http://localhost/api/v1'
const SIGNED = { Authorization: 'Bearer mock-access' }

const call = (path: string, method = 'GET', body?: unknown) =>
  mockFetch(`${API}${path}`, {
    method,
    headers: { ...SIGNED, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

const read = async <T>(path: string, method = 'GET', body?: unknown) => {
  const response = await call(path, method, body)
  return { status: response.status, body: (await response.json()) as T }
}

const errorCode = async (path: string, method = 'GET', body?: unknown) =>
  (await read<{ error: { code: string; details?: Record<string, unknown> } }>(path, method, body)).body.error

const settles = async (promise: Promise<unknown>, ms: number) =>
  Promise.race([promise.then(() => true), new Promise((resolve) => setTimeout(() => resolve(false), ms))])

const using = (persona: Parameters<typeof setMockPersona>[0], ms: string) => {
  setMockPersona(persona)
  setMockSwitches(ms)
}

afterEach(() => {
  setMockSwitches(null)
  vi.unstubAllGlobals()
})

describe('ms= switches', () => {
  it('knows the 52 switches of mock-needs-v2 plus payments-disabled and ignores unknown names', () => {
    expect(MOCK_SWITCHES).toHaveLength(53)
    using('personal', 'nope,docs-empty')
  })

  it('empties the lists the empty-state boards draw', async () => {
    using('personal', 'docs-empty,links-empty,bookmarks-empty,follows-empty,posts-empty,notif-empty,inbox-empty,blocks-empty')
    for (const path of ['/sources', '/me/links', '/me/bookmarks', '/me/follows', '/me/posts', '/me/notifications', '/me/offers', '/me/blocks']) {
      expect((await read<{ data: unknown[] }>(path)).body.data, path).toEqual([])
    }
  })

  it('fails only the request the error boards name', async () => {
    using('personal', 'home-latest-error')
    expect((await call('/postings?sort=latest')).status).toBe(500)
    expect((await call('/postings?sort=deadline')).status).toBe(200)
    using('personal', 'load-fail,social-error,apply-fail,profile-save-fail,docs-delete-fail')
    expect((await call('/postings/p1')).status).toBe(500)
    expect((await call('/posts')).status).toBe(500)
    expect((await call('/postings/p1/apply', 'POST', {})).status).toBe(500)
    expect((await call('/me/profile', 'PATCH', { headline: 'x' })).status).toBe(500)
    expect((await call('/sources/src-resume', 'DELETE')).status).toBe(500)
    expect((await read<{ data: { id: string }[] }>('/sources')).body.data.map((item) => item.id)).toContain('src-resume')
  })

  it('holds the slow requests past the shot', async () => {
    using('personal', 'apply-slow')
    expect(await settles(call('/postings/p1/apply', 'POST', {}), 1000)).toBe(false)
    expect(await settles(call('/me/notifications'), 1000)).toBe(true)
  })

  it('answers the phone code boards', async () => {
    using(null, 'phone-sent')
    expect((await read<{ data: { cooldownSeconds: number } }>('/auth/phone/send', 'POST', { phone: '01012345678' })).body.data.cooldownSeconds).toBe(168)
    using(null, 'login-code-wrong')
    expect((await errorCode('/auth/phone/verify', 'POST', { phone: '01012345678', code: '482931' })).code).toBe('PHONE_CODE_INVALID')
    using(null, 'login-code-limit')
    expect((await call('/auth/phone/verify', 'POST', { phone: '01012345678', code: '000000' })).status).toBe(429)
    using(null, 'login-phone-taken')
    expect((await call('/auth/phone/send', 'POST', { phone: '01012345678' })).status).toBe(202)
    expect(await errorCode('/auth/phone/verify', 'POST', { phone: '01012345678', code: '482913' })).toMatchObject({
      code: 'PHONE_ALREADY_REGISTERED',
      details: { existingProviders: ['google'] },
    })
    using(null, 'signup-consent')
    expect((await read<{ data: { created: boolean } }>('/auth/phone/verify', 'POST', { phone: '01012345678', code: '482913' })).body.data.created).toBe(true)
  })

  it('fails Google sign-in and keeps the switches through the callback url', async () => {
    using(null, '')
    const started = await read<{ data: { authorizationUrl: string } }>('/auth/google/start?accountType=EMPLOYER')
    expect(started.body.data.authorizationUrl).toMatch(/^\/auth\/callback\?mock&code=mock-code/)
    using(null, 'login-social-fail')
    expect((await call('/auth/google/start')).status).toBe(502)
  })

  it('answers the expired and invalid auth links with the recipient', async () => {
    using(null, 'verify-expired,pw-reset-expired,signup-taken-employer')
    expect(await errorCode('/auth/email/verify', 'POST', { token: 'bad' })).toMatchObject({ code: 'TOKEN_EXPIRED', details: { email: 'mina.lee@moapay.kr' } })
    expect((await call('/auth/email/password-reset/confirm', 'POST', { token: 'expired', password: 'Passw0rd12' })).status).toBe(410)
    expect((await errorCode('/auth/email/signup', 'POST', { email: 'mina.lee@moapay.kr' })).details).toEqual({ accountType: 'EMPLOYER' })
  })

  it('answers the invite boards', async () => {
    using('employer-new', '')
    expect((await read<{ data: { companyName: string } }>('/companies/invites/demo-token')).body.data.companyName).toBe('모아페이')
    expect((await call('/companies/invites/bad-token/accept', 'POST')).status).toBe(404)
    using('employer-new', 'invite-expired')
    expect(await errorCode('/companies/invites/expired-token/accept', 'POST')).toMatchObject({
      code: 'NOT_FOUND',
      details: { reason: 'EXPIRED', companyName: '모아페이' },
    })
    using('personal', 'invite-other-account')
    expect(await errorCode('/companies/invites/demo-token/accept', 'POST')).toMatchObject({ code: 'FORBIDDEN', details: { reason: 'EMAIL_MISMATCH' } })
  })

  it('resends an invite after the cooldown and cancels it', async () => {
    using('employer-ultra', '')
    await call('/companies/me/invites', 'POST', { email: 'sora.park@moapay.kr' })
    const [invite] = (await read<{ data: { id: string; invitedAt: string; expiresAt: string }[] }>('/companies/me/invites')).body.data
    expect(invite).toMatchObject({ id: expect.any(String), invitedAt: expect.any(String), expiresAt: expect.any(String) })
    expect(await errorCode(`/companies/me/invites/${invite!.id}/resend`, 'POST')).toMatchObject({ code: 'RATE_LIMITED', details: { retryAfterSec: 60 } })
    expect((await call(`/companies/me/invites/${invite!.id}`, 'DELETE')).status).toBe(204)
    expect((await read<{ data: unknown[] }>('/companies/me/invites')).body.data).toEqual([])
    expect((await read<{ data: { seats: { used: number } } }>('/companies/me')).body.data.seats.used).toBe(0)
    setMockPersona(null)
  })

  it('archives, blocks and reports offers', async () => {
    using('personal', 'blocks-list')
    const names = async (query: string) => (await read<{ data: { sender: { displayName: string } }[] }>(`/me/offers?${query}`)).body.data.map((item) => item.sender.displayName)
    expect(await names('box=received&archived=1')).toEqual(['정하린'])
    expect(await names('box=received')).not.toContain('오지현')
    expect((await read<{ data: { user: { displayName: string }; createdAt: string }[] }>('/me/blocks')).body.data.map((item) => [item.user.displayName, item.createdAt])).toEqual([
      ['오지현', '2026-11-07T01:00:00.000Z'],
      ['한민재', '2026-10-03T01:00:00.000Z'],
    ])
    await call('/me/blocks/u-jihyun', 'DELETE')
    expect(await names('box=received')).toEqual(['오지현', '박도윤', '최지우'])
    await call('/me/offers/offer-1/archive', 'POST')
    expect(await names('box=received&archived=1')).toEqual(['오지현', '정하린'])
    await call('/me/offers/offer-1/unarchive', 'POST')
    expect((await call('/me/offers/offer-1/report', 'POST', {})).status).toBe(204)
  })

  it('draws a failed last message and a closed composer for inbox-cant-send', async () => {
    using('personal', 'inbox-cant-send')
    const thread = await read<{ data: { body: string; status?: string }[] }>('/me/offers/offer-1/messages')
    expect(thread.body.data.at(-1)).toMatchObject({ body: '좋아요, 수요일 4시에 뵐게요', status: 'FAILED' })
    expect((await read<{ data: { canSend?: boolean } }>('/me/offers/offer-1')).body.data.canSend).toBe(false)
  })

  it('answers when each offer was responded to and whether a message can go', async () => {
    using('personal', '')
    const offers = await read<{ data: { id: string; respondedAt: string | null; canSend: boolean }[] }>('/me/offers?box=received')
    expect(offers.body.data.map(({ id, respondedAt, canSend }) => [id, respondedAt, canSend])).toEqual([
      ['offer-1', '2026-10-21T04:20:00.000Z', true],
      ['offer-3', null, false],
      ['offer-4', '2026-10-15T01:00:00.000Z', false],
    ])
  })

  it('answers the Google connection as push-be integrations/google does', async () => {
    using('personal', '')
    expect((await read<{ data: { calendarStatus: string } }>('/integrations/google')).body.data.calendarStatus).toBe('CONNECTED')
    using('personal', 'calendar-google-off')
    expect((await read<{ data: { calendarStatus: string } }>('/integrations/google')).body.data.calendarStatus).toBe('DISCONNECTED')
  })

  it('shows the member view of a Pro company', async () => {
    using('employer-pro', 'role-member')
    const company = await read<{ data: { role: string; seats: { used: number; limit: number } } }>('/companies/me')
    expect(company.body.data).toMatchObject({ role: 'MEMBER', seats: { used: 2, limit: 2 } })
    expect((await call('/companies/me/invites', 'POST', { email: 'a@moapay.kr' })).status).toBe(403)
    expect((await call('/billing/checkout', 'POST', { planId: 'ULTRA' })).status).toBe(403)
    setMockPersona(null)
  })

  it('refuses payments with 503 PAYMENTS_DISABLED like push-be before launch', async () => {
    using('employer', 'payments-disabled')
    for (const [path, body] of [
      ['/billing/checkout', { planId: 'PRO' }],
      ['/billing/topup', { packs: 1 }],
      ['/billing/iap/verify', {}],
    ] as const) {
      const failed = await call(path, 'POST', body)
      expect(failed.status).toBe(503)
      expect((await failed.json()).error.code).toBe('PAYMENTS_DISABLED')
    }
    const billing = await read<{ data: { paymentsEnabled?: boolean } }>('/billing')
    expect(billing.status).toBe(200)
    expect(billing.body.data.paymentsEnabled).toBe(false)
    setMockPersona(null)
  })

  it('lists four ledger rows for billing-ledger', async () => {
    using('employer-pro', 'billing-ledger')
    const ledger = await read<{
      data: { id: string; amountMicroCredits: number; balanceAfter: number; description: string | null; amountUsd: number | null; receiptUrl: string | null }[]
    }>('/billing/ledger')
    const payments = ledger.body.data.filter((item) => item.amountUsd != null)
    expect(payments.map((item) => `${item.description} ${item.amountUsd}`)).toEqual([
      'Pro 월 구독 100',
      'Pro 월 구독 100',
      'Pro 월 구독 100',
      'Basic 월 구독 20',
    ])
    expect(payments.every((item) => item.receiptUrl?.startsWith('https://'))).toBe(true)
    expect(ledger.body.data.filter((item) => item.amountUsd == null).every((item) => item.description === null)).toBe(true)
    expect(new Set(ledger.body.data.map((item) => item.id)).size).toBe(ledger.body.data.length)
    // each balanceAfter is the one below it plus this row, newest first (Basic 3,000 + Pro 15,000 × 3 credits)
    ledger.body.data.forEach((item, index) => {
      expect(item.balanceAfter).toBe((ledger.body.data[index + 1]?.balanceAfter ?? 0) + item.amountMicroCredits)
    })
    expect(ledger.body.data[0]!.balanceAfter).toBe(18_000_000 + 3 * 90_000_000)
    setMockPersona(null)
  })

  it('streams the approval script and answers the choice through follow', async () => {
    using('employer-pro', 'chat-approve')
    const created = await read<{ data: { id: string } }>('/conversations', 'POST', { audience: 'EMPLOYER', title: '' })
    const id = created.body.data.id
    const response = await call(`/conversations/${id}/messages/stream`, 'POST', { text: '서류 통과한 사람 중에 면접 볼 사람 면접 단계로 옮겨 줘', accessMode: 'AUTO' })
    const types: string[] = []
    for await (const event of readEvents<{ type: string; awaiting?: string }>(response.body!)) {
      types.push('awaiting' in event && event.awaiting ? `${event.type}:${event.awaiting}` : event.type)
    }
    expect(types).toEqual(['tool', 'tool', 'token', 'approval', 'done:approval'])
    const list = await read<{ data: { id: string; title: string }[] }>('/conversations?audience=EMPLOYER')
    expect(list.body.data[0]).toMatchObject({ id, title: '서류 통과 지원자 면접 단계로' })
    await call(`/conversations/${id}/approvals/ap-stage`, 'POST', { optionId: 'approve' })
    const follow = await call(`/conversations/${id}/messages/stream/active`)
    const after: string[] = []
    for await (const event of readEvents<{ type: string }>(follow.body!)) after.push(event.type)
    expect(after.at(-1)).toBe('done')
    expect((await call(`/conversations/${id}/messages/stream/active`)).status).toBe(204)
    setMockPersona(null)
  })

  it('spends the month for chat-limit', async () => {
    using('employer-ultra', 'chat-limit')
    expect((await read<{ data: { balanceMicroCredits: number } }>('/billing')).body.data.balanceMicroCredits).toBe(0)
    expect((await errorCode('/conversations/c-review/messages/stream', 'POST', { text: '이 지원자 서류 검토해 줘' })).code).toBe('INSUFFICIENT_CREDITS')
    setMockPersona(null)
  })

  it('stays out of the app WebView', async () => {
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
    using(null, MOCK_SWITCHES.join(','))
    expect((await call('/postings/p1')).status).toBe(200)
  })
})
