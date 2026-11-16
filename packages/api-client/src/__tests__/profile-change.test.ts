import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../errors'
import { createClient } from '../client'
import { createApi } from '../endpoints'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const harness = (reply: (req: Request) => Response) => {
  const hits: string[] = []
  const fetch = vi.fn(async (input: RequestInfo | URL) => {
    const req = input as Request
    hits.push(`${req.method} ${new URL(req.url).pathname} ${req.headers.get('idempotency-key') ?? ''}`)
    return reply(req)
  })
  return { api: createApi(createClient({ baseUrl: 'http://x/api/v1', getToken: () => 't', fetch, uuid: () => 'idem' })), hits }
}

describe('profile change', () => {
  it('reads the change by the changeId of the tool line', async () => {
    const change = { id: 'c1', fields: ['headline'], undone: false, createdAt: 'a' }
    const { api, hits } = harness(() => json(200, { data: change }))
    expect(await api.me.profileChange('c1')).toEqual(change)
    expect(hits).toEqual(['GET /api/v1/me/profile/changes/c1 '])
  })

  it('undoes through POST .../undo and a second call surfaces 409', async () => {
    let calls = 0
    const { api, hits } = harness(() => (++calls === 1 ? json(200, { data: { userId: 'u' } }) : json(409, { error: { code: 'CONFLICT', message: 'change already undone' } })))
    expect(await api.me.undoProfileChange('c1')).toEqual({ userId: 'u' })
    await expect(api.me.undoProfileChange('c1')).rejects.toSatisfy((e) => e instanceof ApiError && e.status === 409)
    expect(hits[0]).toBe('POST /api/v1/me/profile/changes/c1/undo idem')
  })
})
