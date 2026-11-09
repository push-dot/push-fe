import { ApiError, type Offer, type OfferMessage } from '@push/api-client'
import { describe, expect, it } from 'vitest'

import { blockedSend, threadEntries } from './thread-entries'
import { declineMarked, threadFoot } from './thread-foot'

const party = (id: string) => ({ id, displayName: id, avatarUrl: null, companyName: null, headline: '' })
const offer = { id: 'o1', sender: party('them'), recipient: party('me'), message: '제안', createdAt: '2026-10-21T04:12:00.000Z' } as Offer
const at = (status: Offer['status'], over: Partial<Offer> = {}) => ({ ...offer, status, ...over })

describe('threadFoot', () => {
  it('asks a recipient to accept or decline an open offer', () => {
    expect(threadFoot(at('SENT'), 'received')).toBe('respond')
    expect(threadFoot(at('READ'), 'received')).toBe('respond')
  })
  it('shows nothing under an offer the viewer sent and is still waiting on', () => {
    expect(threadFoot(at('SENT'), 'sent')).toBe('none')
  })
  it('closes a declined offer for both sides', () => {
    expect(threadFoot(at('DECLINED'), 'received')).toBe('declined')
    expect(threadFoot(at('DECLINED'), 'sent')).toBe('declined')
  })
  it('follows canSend on an accepted offer and falls back to the status when the field is missing', () => {
    expect(threadFoot(at('ACCEPTED', { canSend: true }), 'received')).toBe('composer')
    expect(threadFoot(at('ACCEPTED', { canSend: false }), 'received')).toBe('closed')
    expect(threadFoot(at('ACCEPTED'), 'sent')).toBe('composer')
  })
  it('closes the composer once a send came back BLOCKED', () => {
    expect(threadFoot(at('ACCEPTED', { canSend: true }), 'received', true)).toBe('closed')
  })
  it('marks the decline only on the recipient side', () => {
    expect(declineMarked(at('DECLINED'), 'received')).toBe(true)
    expect(declineMarked(at('DECLINED'), 'sent')).toBe(false)
  })
})

describe('threadEntries', () => {
  const reply = (id: string, sender: string, status?: string) =>
    ({ id, offerId: 'o1', sender: { id: sender, displayName: '' }, body: id, createdAt: '2026-10-21T05:00:00.000Z', status }) as OfferMessage
  it('opens with the offer message and marks my replies', () => {
    const entries = threadEntries(offer, [reply('a', 'me'), reply('b', 'them')], 'me')
    expect(entries.map((item) => item.mine)).toEqual([false, true, false])
    expect(entries[0]?.body).toBe('제안')
  })
  it('puts my own offer on my side and flags failed messages', () => {
    const entries = threadEntries({ ...offer, sender: party('me') }, [reply('a', 'me', 'FAILED')], 'me')
    expect(entries.map((item) => item.mine)).toEqual([true, true])
    expect(entries.map((item) => item.failed)).toEqual([false, true])
  })
})

describe('blockedSend', () => {
  it('keeps a BLOCKED send as a failed bubble of the viewer', () => {
    const now = new Date('2026-11-10T01:00:00.000Z')
    expect(blockedSend(new ApiError('blocked', 'BLOCKED', 403), '안녕하세요', now)).toEqual({
      id: `blocked-${now.getTime()}`,
      mine: true,
      body: '안녕하세요',
      createdAt: '2026-11-10T01:00:00.000Z',
      failed: true,
    })
  })
  it('leaves any other failure to the retry toast', () => {
    expect(blockedSend(new ApiError('boom', 'INTERNAL', 500), '안녕하세요')).toBeNull()
    expect(blockedSend(new Error('offline'), '안녕하세요')).toBeNull()
  })
})
