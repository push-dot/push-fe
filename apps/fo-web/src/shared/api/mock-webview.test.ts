import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MOCK_SWITCHES, mockFetch, setMockPersona, setMockSwitches } from './mock'

const API = 'http://localhost/api/v1'

const POSTING_IDS = Array.from({ length: 25 }, (_, at) => `p${at + 1}`)
const PROFILE_IDS = ['me', ...Array.from({ length: 12 }, (_, at) => `u${at + 1}`), 'u-doyun', 'u-hyunwoo', 'u-jihyun', 'u-seoyeon', 'u-subin']

const PATHS = [...POSTING_IDS.map((id) => `/postings/${id}`), ...PROFILE_IDS.map((id) => `/profiles/${id}`)]

const answers = async (signed: boolean) => {
  const list = await Promise.all(PATHS.map((path) => answer(path, signed)))
  return Object.fromEntries(PATHS.map((path, at) => [path, list[at]]))
}

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
    expect(await answers(signed)).toMatchSnapshot()
  })

  it('ignores every ms= switch', async () => {
    const plain = await answers(true)
    setMockSwitches(MOCK_SWITCHES.join(','))
    expect(await answers(true)).toEqual(plain)
    setMockSwitches(null)
  })
})
