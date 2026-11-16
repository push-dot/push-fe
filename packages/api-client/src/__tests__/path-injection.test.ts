import { describe, expect, it, vi } from 'vitest'
import { createBotApi } from '../bot-api'
import { createClient } from '../client'
import { createApi } from '../endpoints'
import { ApiError } from '../errors'

const setup = () => {
  const fetch = vi.fn(async () => new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  const client = createClient({ baseUrl: 'https://api.example/api/v1', getToken: () => 'victim-token', fetch, uuid: () => 'k' })
  return { fetch, api: createApi(client), bots: createBotApi(client).bots }
}

describe('ids from links cannot steer an authenticated request', () => {
  it('sends a normal id to its own resource', async () => {
    const { fetch, bots } = setup()
    await bots.markRead('b_123')
    expect((fetch.mock.calls[0] as unknown[])[0]).toMatchObject({ url: 'https://api.example/api/v1/bots/b_123/read' })
  })

  it.each(['../me/withdraw', '%2e%2e/auth/logout', 'x/../../auth/logout', '..\\auth\\logout', 'b1?evil=1', 'b1#', '.\t./me/withdraw', '.\n./me', '%2e\r%2e/me'])(
    'never sends bots/%s/read',
    async (id) => {
      const { fetch, bots } = setup()
      await expect(bots.markRead(id)).rejects.toBeInstanceOf(ApiError)
      expect(fetch).not.toHaveBeenCalled()
    },
  )

  it('guards every endpoint, not one call site', async () => {
    const { fetch, api } = setup()
    await expect(api.postings.bookmark('../../auth/logout')).rejects.toBeInstanceOf(ApiError)
    await expect(api.me.offer('../../companies/me')).rejects.toBeInstanceOf(ApiError)
    expect(fetch).not.toHaveBeenCalled()
  })
})
