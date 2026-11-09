import { afterEach, describe, expect, it, vi } from 'vitest'
import { dDay } from '../lib/format'
import { MOCK_SWITCHES, mockFetch, mockFit, setMockSwitches } from './mock'

const API = 'http://localhost/api/v1'
const SIGNED = { headers: { Authorization: 'Bearer mock-access' } }

const APP_POSTING_IDS = Array.from({ length: 25 }, (_, at) => `p${at + 1}`)
const APP_PROFILE_IDS = ['me', 'u1', 'u2', 'u3', 'u4', 'u5', 'u-haeun', 'u-jihyun']

// The WebView pages render neither the bookmark/apply nor the follow/offer flags (posting actions return null in the WebView).
const UNRENDERED = new Set(['bookmarked', 'applied', 'following', 'offered'])

const rendered = (data: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(data)
      .filter(([key]) => !UNRENDERED.has(key))
      .map(([key, value]) => (key === 'deadline' ? [key, dDay(value as string | null)] : [key, value])),
  )

const read = async (path: string, init?: RequestInit) => {
  const response = await mockFetch(`${API}${path}`, init)
  const body = (await response.json()) as { data?: Record<string, unknown> }
  return { status: response.status, data: body.data ? rendered(body.data) : body }
}

const pinned = async () => {
  const paths = [...APP_POSTING_IDS.map((id) => `/postings/${id}`), ...APP_PROFILE_IDS.map((id) => `/profiles/${id}`), '/auth/me']
  const signed = await Promise.all(paths.map(async (path) => [path, await read(path, SIGNED)] as const))
  const guest = await Promise.all(paths.map(async (path) => [path, await read(path)] as const))
  return JSON.stringify({ signed: Object.fromEntries(signed), guest: Object.fromEntries(guest), fit: mockFit }, null, 2)
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('app WebView data', () => {
  it('stays as fix/web-mock 03f4169 serves it', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T10:00:00+09:00'))
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
    await expect(await pinned()).toMatchFileSnapshot('./__snapshots__/webview-pin.json')
  })

  it('ignores every ms= switch', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-21T10:00:00+09:00'))
    vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
    const plain = await pinned()
    setMockSwitches(MOCK_SWITCHES.join(','))
    const switched = await pinned()
    setMockSwitches(null)
    expect(switched).toEqual(plain)
  })
})
