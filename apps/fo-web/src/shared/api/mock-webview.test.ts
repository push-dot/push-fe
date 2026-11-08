import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockFetch, setMockPersona } from './mock'

const API = 'http://localhost/api/v1'

const POSTING_IDS = Array.from({ length: 25 }, (_, at) => `p${at + 1}`)
const PROFILE_IDS = ['me', ...Array.from({ length: 12 }, (_, at) => `u${at + 1}`), 'u-doyun', 'u-hyunwoo', 'u-jihyun', 'u-seoyeon', 'u-subin']

const answer = async (path: string, signed: boolean) => {
  const response = await mockFetch(`${API}${path}`, signed ? { headers: { Authorization: 'Bearer app-token' } } : undefined)
  return { status: response.status, body: (await response.json()) as unknown }
}

beforeEach(() => {
  vi.stubGlobal('window', { ReactNativeWebView: { postMessage: () => {} } })
  vi.useFakeTimers({ now: Date.parse('2026-10-21T01:00:00Z'), toFake: ['Date'] })
  setMockPersona(null)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('app WebView detail data', () => {
  it.each([true, false])('serves the PR #180 fixtures (signed %s)', async (signed) => {
    const paths = [...POSTING_IDS.map((id) => `/postings/${id}`), ...PROFILE_IDS.map((id) => `/profiles/${id}`)]
    const answers = await Promise.all(paths.map((path) => answer(path, signed)))
    expect(Object.fromEntries(paths.map((path, at) => [path, answers[at]]))).toMatchSnapshot()
  })
})
