import { describe, expect, it } from 'vitest'

import { offerBadge } from './offer-status'

describe('offerBadge', () => {
  it('calls every open received offer 새 제안 in the accent tone', () => {
    expect(offerBadge({ status: 'SENT' }, 'received')).toEqual({ label: '새 제안', tone: 'ac' })
    expect(offerBadge({ status: 'READ' }, 'received')).toEqual({ label: '새 제안', tone: 'ac' })
  })

  it('tells the sender whether an open offer was read', () => {
    expect(offerBadge({ status: 'SENT' }, 'sent')).toEqual({ label: '읽지 않음', tone: 'grey' })
    expect(offerBadge({ status: 'READ' }, 'sent')).toEqual({ label: '읽음', tone: 'grey' })
  })

  it('labels accepted green and declined grey in either box', () => {
    expect(offerBadge({ status: 'ACCEPTED' }, 'sent')).toEqual({ label: '수락함', tone: 'green' })
    expect(offerBadge({ status: 'DECLINED' }, 'received')).toEqual({ label: '거절함', tone: 'grey' })
  })

  it('calls an archived offer 보관함 whatever its status', () => {
    expect(offerBadge({ status: 'SENT', archivedAt: '2026-10-10T00:00:00Z' }, 'received')).toEqual({ label: '보관함', tone: 'grey' })
  })
})
