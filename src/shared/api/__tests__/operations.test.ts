import { describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('../client', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}))

import type { Operation } from '../operations'

const load = async () => {
  vi.resetModules()
  const { waitForOperation } = await import('../operations')
  const { api } = await import('../client')
  const mocked = api as unknown as { get: Mock; post: Mock }
  mocked.get.mockReset()
  return { waitForOperation, api: mocked }
}

const operation = (status: Operation['status']): Operation => ({
  id: 'op1',
  type: 'GENERIC',
  applicationId: null,
  status,
  progress: null,
  result: null,
  error: null,
  inputRequest: null,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
})

const ok = (op: Operation) =>
  ({ status: 200, text: async () => JSON.stringify({ data: op }) }) as never

describe('waitForOperation', () => {
  it('retries transient poll failures before succeeding', async () => {
    const { waitForOperation, api } = await load()
    api.get
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(ok(operation('SUCCEEDED')))
    const result = await waitForOperation('op1', { intervalMs: 1 })
    expect(result.status).toBe('SUCCEEDED')
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('throws after the retry budget is exhausted', async () => {
    const { waitForOperation, api } = await load()
    api.get.mockRejectedValue(new Error('down'))
    await expect(waitForOperation('op1', { intervalMs: 1 })).rejects.toThrow()
    expect(api.get).toHaveBeenCalledTimes(3)
  })

  it('returns on terminal status without extra polls', async () => {
    const { waitForOperation, api } = await load()
    api.get.mockResolvedValue(ok(operation('FAILED')))
    const result = await waitForOperation('op1', { intervalMs: 1 })
    expect(result.status).toBe('FAILED')
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})
