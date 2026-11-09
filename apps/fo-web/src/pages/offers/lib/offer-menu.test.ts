import type { Offer } from '@push/api-client'
import { describe, expect, it, vi } from 'vitest'

import { offerMenu, offerMenuKeys, otherParty, viewerBox, type OfferMenuDeps } from './offer-menu'

const party = (id: string) => ({ id, displayName: id, avatarUrl: null, companyName: null, headline: '' })
const offer = { id: 'o1', sender: party('them'), recipient: party('me') } as Offer
const sent = { ...offer, sender: party('me'), recipient: party('them') } as Offer
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const deps = (over: Partial<OfferMenuDeps> = {}): OfferMenuDeps => ({
  archive: vi.fn(async () => undefined),
  unarchive: vi.fn(async () => undefined),
  report: vi.fn(async () => undefined),
  block: vi.fn(async () => undefined),
  refresh: vi.fn(async () => undefined),
  back: vi.fn(),
  toast: vi.fn(),
  ...over,
})

describe('offerMenu', () => {
  it('blocks the other party, whichever box the offer came from', async () => {
    expect(otherParty(offer, 'received').id).toBe('them')
    expect(otherParty(offer, 'sent').id).toBe('me')
    const d = deps()
    await offerMenu(offer, 'received', d).block()
    expect(d.block).toHaveBeenCalledWith('them')
    expect(d.back).toHaveBeenCalled()
    expect(d.refresh).toHaveBeenCalled()
    expect(vi.mocked(d.toast).mock.calls[0]![0]).toEqual({ message: 'them 님을 차단했어요' })
  })

  it('blocks the recipient of a sent offer, never yourself', async () => {
    const d = deps()
    await offerMenu(sent, viewerBox(sent, 'me', 'received'), d).block()
    expect(d.block).toHaveBeenCalledWith('them')
  })

  it('archives with an undo that unarchives and re-reads', async () => {
    const d = deps()
    await offerMenu(offer, 'received', d).archive()
    expect(d.back).toHaveBeenCalled()
    const toast = vi.mocked(d.toast).mock.calls[0]![0]
    expect(toast.message).toBe('제안을 보관했어요')
    expect(toast.action?.label).toBe('되돌리기')
    toast.action!.onClick()
    await flush()
    expect(d.unarchive).toHaveBeenCalledWith('o1')
    expect(d.refresh).toHaveBeenCalledTimes(2)
  })

  it('shows the error toast and re-reads when the undo fails', async () => {
    const d = deps({ unarchive: vi.fn(async () => Promise.reject(new Error('x'))) })
    await offerMenu(offer, 'received', d).archive()
    vi.mocked(d.toast).mock.calls[0]![0].action!.onClick()
    await flush()
    expect(vi.mocked(d.toast).mock.calls[1]![0]).toEqual({ message: '잠시 뒤에 다시 시도해 주세요.', tone: 'err' })
    expect(d.refresh).toHaveBeenCalledTimes(2)
  })

  it('stays on the screen and shows the error toast when an action fails', async () => {
    const d = deps({ archive: vi.fn(async () => Promise.reject(new Error('x'))) })
    await offerMenu(offer, 'received', d).archive()
    expect(d.back).not.toHaveBeenCalled()
    expect(vi.mocked(d.toast).mock.calls[0]![0].tone).toBe('err')
    expect(d.refresh).toHaveBeenCalled()
  })

  it('reports with a plain toast and stays on the offer', async () => {
    const d = deps()
    await offerMenu(offer, 'received', d).report()
    expect(d.report).toHaveBeenCalledWith('o1')
    expect(d.back).not.toHaveBeenCalled()
    expect(vi.mocked(d.toast).mock.calls[0]![0]).toEqual({ message: '신고가 접수됐어요' })
  })

  it('unarchives without leaving the screen or a toast', async () => {
    const d = deps()
    await offerMenu({ ...offer, archivedAt: '2026-10-01T00:00:00Z' }, 'received', d).unarchive()
    expect(d.unarchive).toHaveBeenCalledWith('o1')
    expect(d.back).not.toHaveBeenCalled()
    expect(d.toast).not.toHaveBeenCalled()
    expect(d.refresh).toHaveBeenCalled()
  })
})

describe('viewerBox', () => {
  it('takes the side from the session, whatever the route box says', () => {
    expect(viewerBox(offer, 'me', 'sent')).toBe('received')
    expect(viewerBox(sent, 'me', 'received')).toBe('sent')
  })

  it('falls back to the route box when the session is neither party', () => {
    expect(viewerBox(offer, undefined, 'sent')).toBe('sent')
    expect(viewerBox(offer, 'stranger', 'received')).toBe('received')
  })
})

describe('offerMenuKeys', () => {
  it('offers 보관 for a received offer and 보관 풀기 once it is archived', () => {
    expect(offerMenuKeys(offer, 'received')).toEqual([['profile', 'archive'], ['report', 'block']])
    expect(offerMenuKeys({ ...offer, archivedAt: '2026-10-01T00:00:00Z' }, 'received')).toEqual([['profile', 'unarchive'], ['report', 'block']])
  })

  it('does not archive an offer the viewer sent, but still releases an archived one', () => {
    expect(offerMenuKeys(sent, 'sent')).toEqual([['profile'], ['report', 'block']])
    expect(offerMenuKeys({ ...sent, archivedAt: '2026-10-01T00:00:00Z' }, 'sent')[0]).toEqual(['profile', 'unarchive'])
  })
})
