import { describe, expect, it } from 'vitest'
import { offerStatusLabel, offerStatusTone } from './offer-status'

describe('offerStatusLabel', () => {
  it('calls a received SENT offer 새 제안', () => {
    expect(offerStatusLabel('SENT', 'received')).toBe('새 제안')
  })

  it('calls a sent SENT offer 읽지 않음', () => {
    expect(offerStatusLabel('SENT', 'sent')).toBe('읽지 않음')
  })

  it('labels read, accepted, and declined offers the same in either box', () => {
    expect(offerStatusLabel('READ', 'received')).toBe('읽음')
    expect(offerStatusLabel('READ', 'sent')).toBe('읽음')
    expect(offerStatusLabel('ACCEPTED', 'sent')).toBe('수락함')
    expect(offerStatusLabel('DECLINED', 'received')).toBe('거절함')
  })
})

describe('offerStatusTone', () => {
  it('tones a received SENT offer ac, ACCEPTED green, and the rest grey', () => {
    expect(offerStatusTone('SENT', 'received')).toBe('ac')
    expect(offerStatusTone('SENT', 'sent')).toBe('grey')
    expect(offerStatusTone('ACCEPTED', 'received')).toBe('green')
    expect(offerStatusTone('DECLINED', 'received')).toBe('grey')
  })
  it('calls every archived offer 보관함 in grey', () => {
    expect(offerStatusLabel('SENT', 'archived')).toBe('보관함')
    expect(offerStatusTone('SENT', 'archived')).toBe('grey')
  })
})
