import { describe, expect, it } from 'vitest'
import { offerStatusLabel } from './offer-status'

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
