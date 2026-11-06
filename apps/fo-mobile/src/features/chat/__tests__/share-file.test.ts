import { describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => [] as (string | null)[])
vi.mock('@/shared/infrastructure', async () => {
  const { createApi, createClient } = await import('@push/api-client')
  const { mockFetch } = await import('@/mock')
  const fetch = (req: Request) => (auth.push(req.headers.get('Authorization')), mockFetch(req))
  const http = createClient({ baseUrl: 'http://x/api/v1', getToken: () => 'token', fetch: fetch as typeof globalThis.fetch, uuid: () => 'k' })
  return { api: createApi(http), http, API_MOCK: true }
})
vi.mock('@/features/my', () => ({ myApi: {} }))

const { fetchDocumentPdf, fetchSourceBytes } = await import('../api/fetchers')
const head = (bytes: Uint8Array) => String.fromCharCode(...bytes.slice(0, 5))

describe('result file share', () => {
  it('downloads the document export PDF with the session token', async () => {
    auth.length = 0
    const pdf = await fetchDocumentPdf('src-upload')
    expect(pdf.title).toBe('김서준_모아페이_백엔드')
    expect(head(pdf.bytes)).toBe('%PDF-')
    expect(auth).toEqual(['Bearer token', 'Bearer token'])
  })

  it('downloads an upload as its stored bytes', async () => {
    expect(head(await fetchSourceBytes('s1'))).toBe('%PDF-')
  })

  it('fails instead of sharing a name when the card has no document', async () => {
    await expect(fetchDocumentPdf('')).rejects.toThrow()
    await expect(fetchDocumentPdf('missing')).rejects.toThrow()
  })
})
