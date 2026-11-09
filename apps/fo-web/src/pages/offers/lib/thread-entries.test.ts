import { describe, expect, it } from 'vitest'

import type { OfferGap, OfferMessageGap } from '../../../entities/offer'
import { threadEntries } from './thread-entries'

const party = { displayName: '', avatarUrl: null, companyName: null, headline: '' }
const offer = { id: 'o1', sender: { id: 'peer', ...party }, recipient: { id: 'me', ...party }, message: '제안', createdAt: '2026-10-21T04:12:00.000Z' } as OfferGap
const reply = (id: string, sender: string, status?: 'FAILED'): OfferMessageGap => ({ id, offerId: 'o1', sender: { id: sender, displayName: '' }, body: id, createdAt: '2026-10-21T05:00:00.000Z', status })

describe('threadEntries', () => {
  it('opens with the offer message from the sender and marks my replies', () => {
    const entries = threadEntries(offer, [reply('a', 'me'), reply('b', 'peer')], 'me')
    expect(entries.map((item) => item.mine)).toEqual([false, true, false])
    expect(entries[0]?.body).toBe('제안')
  })
  it('puts my own offer on my side and flags failed messages', () => {
    const entries = threadEntries({ ...offer, sender: { ...offer.sender, id: 'me' } }, [reply('a', 'me', 'FAILED')], 'me')
    expect(entries.map((item) => item.mine)).toEqual([true, true])
    expect(entries.map((item) => item.failed)).toEqual([false, true])
  })
})
