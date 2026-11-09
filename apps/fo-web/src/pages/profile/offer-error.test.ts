import { ApiError } from '@push/api-client'
import { describe, expect, it } from 'vitest'
import { offerFailure } from './offer-error'

describe('offerFailure', () => {
  it('turns a 403 BLOCKED into the blocked state', () => {
    expect(offerFailure(new ApiError('blocked', 'BLOCKED', 403))).toEqual({ blocked: true })
  })

  it('says the offer was already sent on a conflict', () => {
    expect(offerFailure(new ApiError('dup', 'CONFLICT', 409))).toEqual({ blocked: false, message: '이미 제안을 보냈어요.' })
  })

  it('falls back to the retry copy for anything else', () => {
    expect(offerFailure(new Error('network'))).toEqual({ blocked: false, message: '제안을 보내지 못했어요. 잠시 후 다시 시도해 주세요.' })
  })
})
