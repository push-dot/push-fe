import { describe, expect, it, vi } from 'vitest'
import { LINK_COPIED_TOAST } from './constants'
import { shareLink } from './share-link'

describe('shareLink', () => {
  it('copies the url and asks for a toast when share is missing', async () => {
    const copy = vi.fn(async () => {})
    const toast = await shareLink({ url: 'https://push.test/postings/p2', copy })
    expect(copy).toHaveBeenCalledWith('https://push.test/postings/p2')
    expect(toast).toBe(LINK_COPIED_TOAST)
  })

  it('copies the url and asks for a toast when share rejects', async () => {
    const copy = vi.fn(async () => {})
    const share = vi.fn(async () => {
      throw new DOMException('canceled', 'AbortError')
    })
    const toast = await shareLink({ url: 'https://push.test/postings/p1', share, copy })
    expect(share).toHaveBeenCalledWith({ url: 'https://push.test/postings/p1' })
    expect(copy).toHaveBeenCalledWith('https://push.test/postings/p1')
    expect(toast).toBe(LINK_COPIED_TOAST)
  })

  it('copies and toasts when this url cannot be shared', async () => {
    const copy = vi.fn(async () => {})
    const share = vi.fn(async () => {})
    const toast = await shareLink({
      url: 'http://localhost:5175/postings/p2',
      canShare: () => false,
      share,
      copy,
    })
    expect(share).not.toHaveBeenCalled()
    expect(copy).toHaveBeenCalledWith('http://localhost:5175/postings/p2')
    expect(toast).toBe(LINK_COPIED_TOAST)
  })

  it('copies and toasts on a desktop pointer even when share would succeed', async () => {
    const copy = vi.fn(async () => {})
    const share = vi.fn(async () => {})
    const toast = await shareLink({
      url: 'http://localhost:5175/postings/p2',
      finePointer: true,
      canShare: () => true,
      share,
      copy,
    })
    expect(share).not.toHaveBeenCalled()
    expect(copy).toHaveBeenCalledWith('http://localhost:5175/postings/p2')
    expect(toast).toBe(LINK_COPIED_TOAST)
  })

  it('leaves the toast unused when the system share sheet accepts the url', async () => {
    const copy = vi.fn(async () => {})
    const share = vi.fn(async () => {})
    const toast = await shareLink({ url: 'https://push.test/postings/p1', share, copy })
    expect(copy).not.toHaveBeenCalled()
    expect(toast).toBeNull()
  })
})
